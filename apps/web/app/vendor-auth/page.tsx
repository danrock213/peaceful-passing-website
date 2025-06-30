// app/vendor-auth/page.tsx
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function VendorAuthPage() {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const supabase = createClient();

  // Fetch role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  // Assign vendor role if missing or incorrect
  if (!profile || profile.role !== "vendor") {
    await supabase
      .from("profiles")
      .update({ role: "vendor" })
      .eq("id", userId);
  }

  // Check if vendor already has a vendor profile
  const { data: vendor } = await supabase
    .from("vendors")
    .select("id")
    .eq("created_by", userId)
    .maybeSingle();

  if (vendor) {
    redirect("/vendor/bookings"); // Existing vendor
  } else {
    redirect("/vendors/create"); // New vendor onboarding
  }
}
