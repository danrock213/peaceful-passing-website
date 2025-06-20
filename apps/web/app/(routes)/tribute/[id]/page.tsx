"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTributeById, saveTribute, addRSVPToTribute } from "@/lib/data/tributes";
import { Tribute, RSVP } from "@/types/tribute"; // ✅ Ensure RSVP is imported if needed

export type Tab = "tribute" | "obituary" | "details";

export default function TributeDetailPage() {
  const params = useParams();
  const router = useRouter();

  const id: string = typeof params?.id === "string"
    ? params.id
    : Array.isArray(params?.id)
    ? params.id[0]
    : "";

  const [tribute, setTribute] = useState<Tribute | null>(null);
  const [formState, setFormState] = useState<Partial<Tribute>>({});
  const [activeTab, setActiveTab] = useState<Tab>("tribute");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [rsvpName, setRsvpName] = useState("");
  const [attending, setAttending] = useState(true);
  const [rsvpError, setRsvpError] = useState("");
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false);

  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({
    tribute: null,
    obituary: null,
    details: null,
  });

  const setTabRef = useCallback(
    (tab: Tab) => (el: HTMLButtonElement | null) => {
      tabRefs.current[tab] = el;
    },
    []
  );

  useEffect(() => {
    if (!id) return;

    async function fetchTribute() {
      setLoading(true);
      try {
        const found = await getTributeById(id);
        if (found) {
          setTribute(found);
          setFormState(found);
          setNotFound(false);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    fetchTribute();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (name === "rsvpEnabled" && type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormState((prev) => ({
        ...prev,
        funeralDetails: {
          ...(prev.funeralDetails ?? tribute?.funeralDetails ?? { rsvpList: [] }),
          rsvpEnabled: checked,
        },
      }));
    } else if (name.startsWith("funeralDetails.")) {
      const key = name.replace("funeralDetails.", "");
      setFormState((prev) => ({
        ...prev,
        funeralDetails: {
          ...(prev.funeralDetails ?? tribute?.funeralDetails ?? {}),
          [key]: value,
        },
      }));
    } else {
      setFormState((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSave = async () => {
    if (!formState.name || formState.name.trim() === "" || !tribute) return;

    const updated: Tribute = {
      ...tribute,
      ...formState,
      birthDate: formState.birthDate ?? "",
      deathDate: formState.deathDate ?? "",
      obituaryText: formState.obituaryText ?? "",
      funeralDetails: {
        rsvpEnabled: false,
        rsvpList: [],
        dateTime: "",
        location: "",
        rsvpLink: "",
        notes: "",
        ...tribute.funeralDetails,
        ...formState.funeralDetails,
      },
    };

    try {
      await saveTribute(updated);
      setTribute(updated);
      setFormState(updated);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save tribute", err);
    }
  };

  const handleCancel = () => {
    if (tribute) {
      setFormState(tribute);
      setIsEditing(false);
      setRsvpError("");
    }
  };

  const handleRSVP = async () => {
    setRsvpError("");
    if (!rsvpName.trim()) {
      setRsvpError("Please enter your name before submitting.");
      return;
    }
    if (!id) return;

    setRsvpSubmitting(true);
    try {
      const rsvp: RSVP = {
        name: rsvpName.trim(),
        attending,
        timestamp: new Date().toISOString(),
      };
      await addRSVPToTribute(id, rsvp);
      setRsvpName("");
      const updated = await getTributeById(id);
      if (updated) setTribute(updated);
    } catch {
      setRsvpError("Failed to submit RSVP. Please try again.");
    } finally {
      setRsvpSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const tabs: Tab[] = ["tribute", "obituary", "details"];
    const index = tabs.indexOf(activeTab);
    let nextIndex = index;

    if (e.key === "ArrowRight") {
      nextIndex = (index + 1) % tabs.length;
    } else if (e.key === "ArrowLeft") {
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    }

    if (nextIndex !== index) {
      setActiveTab(tabs[nextIndex]);
      tabRefs.current[tabs[nextIndex]]?.focus();
    }
  };

  const formatDate = (dateStr?: string) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Unknown";

  if (loading)
    return (
      <main className="max-w-4xl mx-auto mt-20 text-center text-gray-500">
        Loading tribute...
      </main>
    );

  if (notFound || !tribute) {
    return (
      <main className="max-w-4xl mx-auto mt-20 text-center text-gray-500">
        <p>Tribute not found.</p>
        <button
          onClick={() => router.push("/tribute")}
          className="mt-4 px-4 py-2 border rounded text-[#1D3557] hover:bg-gray-100"
        >
          Back to Tributes
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-6 bg-white rounded shadow mt-10">
      {/* Your tab UI and tribute detail form go here */}
    </main>
  );
}
