import { openai } from "@ai-sdk/openai";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { kv } from "@vercel/kv";
import { streamText } from "ai"; // expects CreateMessage[]
import { match } from "ts-pattern";
import type { CreateMessage } from "ai"; // Importing from "ai"

export const runtime = "edge";

const useVercelKV = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
const useRedis = !useVercelKV && Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

const redisClient = useRedis
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL ?? "",
      token: process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
    })
  : undefined;

const ratelimitRedis = redisClient
  ? new Ratelimit({
      redis: redisClient,
      limiter: Ratelimit.slidingWindow(50, "1 d"),
    })
  : undefined;

const ratelimitKV = useVercelKV
  ? new Ratelimit({
      redis: kv as any, // Cast as any because kv type !== Redis but compatible
      limiter: Ratelimit.slidingWindow(50, "1 d"),
    })
  : undefined;

interface RequestBody {
  prompt: string;
  option: string;
  command?: string;
}

export async function POST(req: Request): Promise<Response> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return new Response("Missing OPENAI_API_KEY - add it to your .env file.", { status: 400 });
    }

    const body: RequestBody = await req.json();
    const ip = req.headers.get("x-forwarded-for") ?? "unknown_ip";

    if (ratelimitKV) {
      const { success, limit, reset, remaining } = await ratelimitKV.limit(`ai_ratelimit_${ip}`);
      if (!success) {
        return new Response("You have reached your request limit for the day.", {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        });
      }
    } else if (ratelimitRedis) {
      const { success, limit, reset, remaining } = await ratelimitRedis.limit(`ai_ratelimit_${ip}`);
      if (!success) {
        return new Response("You have reached your request limit for the day.", {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        });
      }
    }

    const { prompt, option, command } = body;

    const messages: CreateMessage[] = match(option)
      .with("continue", () => [
        {
          role: "system" as const,
          content:
            "You are an AI writing assistant that continues existing text based on context from prior text. " +
            "Give more weight/priority to the later characters than the beginning ones. " +
            "Limit your response to no more than 200 characters, but make sure to construct complete sentences. " +
            "Use Markdown formatting when appropriate.",
        },
        { role: "user" as const, content: prompt },
      ])
      .with("improve", () => [
        {
          role: "system" as const,
          content:
            "You are an AI writing assistant that improves existing text. " +
            "Limit your response to no more than 200 characters, but make sure to construct complete sentences. " +
            "Use Markdown formatting when appropriate.",
        },
        { role: "user" as const, content: `The existing text is: ${prompt}` },
      ])
      .with("shorter", () => [
        {
          role: "system" as const,
          content: "You are an AI writing assistant that shortens existing text. Use Markdown formatting when appropriate.",
        },
        { role: "user" as const, content: `The existing text is: ${prompt}` },
      ])
      .with("longer", () => [
        {
          role: "system" as const,
          content: "You are an AI writing assistant that lengthens existing text. Use Markdown formatting when appropriate.",
        },
        { role: "user" as const, content: `The existing text is: ${prompt}` },
      ])
      .with("fix", () => [
        {
          role: "system" as const,
          content:
            "You are an AI writing assistant that fixes grammar and spelling errors in existing text. " +
            "Limit your response to no more than 200 characters, but make sure to construct complete sentences. " +
            "Use Markdown formatting when appropriate.",
        },
        { role: "user" as const, content: `The existing text is: ${prompt}` },
      ])
      .with("zap", () => [
        {
          role: "system" as const,
          content:
            "You are an AI writing assistant that generates text based on a prompt. " +
            "You take an input from the user and a command for manipulating the text. " +
            "Use Markdown formatting when appropriate.",
        },
        { role: "user" as const, content: `For this text: ${prompt}. You have to respect the command: ${command}` },
      ])
      .otherwise(() => [
        {
          role: "system" as const,
          content: "You are an AI writing assistant that generates text based on a prompt. Use Markdown formatting when appropriate.",
        },
        { role: "user" as const, content: prompt },
      ]);

    const result = await streamText({
      model: openai("gpt-4o-mini"),
      messages,
      maxTokens: 4096,
      temperature: 0.7,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Unified AI POST handler error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
