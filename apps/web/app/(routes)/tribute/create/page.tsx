"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Tribute } from "@/types/tribute";
import { v4 as uuidv4 } from "uuid";
import TributeForm from "@/components/tribute/TributeForm";
import { useTributes } from "@/hooks/useTributes";

export default function CreateTributePage() {
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const { addTribute } = useTributes();

  useEffect(() => {
    if (!isSignedIn && typeof window !== "undefined") {
      router.push("/sign-in?redirect_url=/tribute/create");
    }
  }, [isSignedIn, router]);

  // Render nothing while redirecting or loading user
  if (!isSignedIn || !user) return null;

  // Fix: accept data without "id" only; add createdBy here
  const handleCreate = (data: Omit<Tribute, "id">) => {
    const newTribute: Tribute = {
      id: uuidv4(),
      ...data,
      createdBy: user.id,
    };
    addTribute(newTribute);
    router.push(`/tribute/${newTribute.id}`);
  };

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-[#1D3557]">Create a Tribute Page</h1>
      <TributeForm
        initialData={{
          name: "",
          birthDate: "",
          deathDate: "",
          bio: "",
          story: "",
          photoUrl: "",
          funeralDetails: {
            dateTime: "",
            location: "",
            rsvpLink: "",
            rsvpEnabled: false,
            rsvpList: [],
            notes: "",
          },
          tags: [],
        } as Omit<Tribute, "id" | "createdBy">} // keep this cast
        onSubmit={handleCreate}
        submitLabel="Save Tribute"
      />
    </main>
  );
}
