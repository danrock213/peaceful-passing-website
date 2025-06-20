"use client";

import React, { useState, useEffect } from "react";
import { Tribute, FuneralDetails } from "@/types/tribute";

interface TributeFormProps {
  initialData: Omit<Tribute, "id" | "createdBy">;
  onSubmit: (data: Omit<Tribute, "id">) => void;
  submitLabel: string;
}

const emptyFuneralDetails: FuneralDetails = {
  dateTime: "",
  location: "",
  rsvpLink: "",
  rsvpEnabled: false,
  rsvpList: [],
  notes: "",
};

const TributeForm: React.FC<TributeFormProps> = ({
  initialData,
  onSubmit,
  submitLabel,
}) => {
  const [form, setForm] = useState<Omit<Tribute, "id" | "createdBy">>({
    name: "",
    birthDate: "",
    deathDate: "",
    bio: "",
    story: "",
    photoUrl: "",
    funeralDetails: emptyFuneralDetails,
    tags: [],
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        funeralDetails: {
          ...emptyFuneralDetails,
          ...initialData.funeralDetails,
        },
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    const funeralMap: Record<string, keyof FuneralDetails> = {
      funeralDate: "dateTime",
      funeralLocation: "location",
      funeralRsvpLink: "rsvpLink",
      funeralNotes: "notes",
    };

    if (name in funeralMap) {
      const key = funeralMap[name];
      setForm((prev) => ({
        ...prev,
        funeralDetails: {
          ...prev.funeralDetails,
          [key]: value,
        },
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...form,
      createdBy: "", // createdBy will be replaced by parent component
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white p-6 rounded shadow max-w-2xl mx-auto"
    >
      <h2 className="text-2xl font-bold text-[#1D3557] mb-4">{submitLabel}</h2>

      <input
        type="text"
        name="name"
        placeholder="Full Name"
        value={form.name}
        onChange={handleChange}
        className="w-full border p-2 rounded"
        required
      />

      <div className="flex gap-4">
        <input
          type="date"
          name="birthDate"
          value={form.birthDate}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="date"
          name="deathDate"
          value={form.deathDate}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
      </div>

      <textarea
        name="bio"
        placeholder="Short Biography"
        value={form.bio}
        onChange={handleChange}
        className="w-full border p-2 rounded"
        rows={3}
        required
      />

      <textarea
        name="story"
        placeholder="Their Story (optional)"
        value={form.story}
        onChange={handleChange}
        className="w-full border p-2 rounded"
        rows={6}
      />

      <input
        type="url"
        name="photoUrl"
        placeholder="Photo URL"
        value={form.photoUrl}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />

      <hr className="my-4" />

      <h3 className="text-xl font-semibold text-[#1D3557]">Funeral Information</h3>

      <input
        type="datetime-local"
        name="funeralDate"
        value={form.funeralDetails?.dateTime ?? ""}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />

      <input
        type="text"
        name="funeralLocation"
        placeholder="Location"
        value={form.funeralDetails?.location ?? ""}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />

      <input
        type="url"
        name="funeralRsvpLink"
        placeholder="RSVP Link"
        value={form.funeralDetails?.rsvpLink ?? ""}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />

      <textarea
        name="funeralNotes"
        placeholder="Additional Notes"
        value={form.funeralDetails?.notes ?? ""}
        onChange={handleChange}
        className="w-full border p-2 rounded"
        rows={3}
      />

      <button
        type="submit"
        className="bg-[#1D3557] text-white px-4 py-2 rounded hover:bg-[#F4A261] hover:text-[#1D3557] transition"
      >
        {submitLabel}
      </button>
    </form>
  );
};

export default TributeForm;
