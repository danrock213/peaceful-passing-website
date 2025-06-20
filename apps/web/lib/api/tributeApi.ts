import { Tribute, FuneralDetails, RSVP } from "@/types/tribute";

const API_BASE_PATH = "/api/tributes";

function getApiUrl(path = ""): string {
  if (typeof window === "undefined") {
    const origin = process.env.NEXT_PUBLIC_APP_ORIGIN ?? "http://localhost:3000";
    return `${origin}${API_BASE_PATH}${path}`;
  }
  return `${API_BASE_PATH}${path}`;
}

export async function getTributes(): Promise<Tribute[]> {
  try {
    const res = await fetch(getApiUrl(), { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch tributes: ${res.statusText}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("Error fetching tributes:", e);
    return getMockTributes();
  }
}

export async function getTributeById(id: string): Promise<Tribute | undefined> {
  try {
    const res = await fetch(getApiUrl(`/${id}`), { cache: "no-store" });
    if (!res.ok) {
      if (res.status === 404) return undefined;
      throw new Error(`Failed to fetch tribute: ${res.statusText}`);
    }
    return await res.json();
  } catch (e) {
    console.error(`Error fetching tribute ${id}:`, e);
    return undefined;
  }
}

export async function saveTribute(tribute: Tribute): Promise<Tribute | undefined> {
  const method = tribute.id ? "PUT" : "POST";
  const endpoint = tribute.id ? getApiUrl(`/${tribute.id}`) : getApiUrl();

  try {
    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tribute),
    });
    if (!res.ok) throw new Error(`Failed to ${method === "POST" ? "create" : "update"} tribute: ${res.statusText}`);
    return await res.json();
  } catch (e) {
    console.error("Error saving tribute:", e);
    return undefined;
  }
}

export async function deleteTribute(id: string): Promise<boolean> {
  try {
    const res = await fetch(getApiUrl(`/${id}`), {
      method: "DELETE",
    });
    return res.ok;
  } catch (e) {
    console.error(`Error deleting tribute ${id}:`, e);
    return false;
  }
}

export async function addRSVPToTribute(
  tributeId: string,
  name: string,
  attending: boolean
): Promise<Tribute | undefined> {
  const tribute = await getTributeById(tributeId);
  if (!tribute) return undefined;

  // Normalize RSVP list
  const existingList = Array.isArray(tribute.funeralDetails?.rsvpList)
    ? tribute.funeralDetails.rsvpList
    : [];

  const newRSVP: RSVP = {
    name,
    attending,
    timestamp: new Date().toISOString(),
  };

  const updatedList = existingList.filter((r) => r.name !== name).concat(newRSVP);

  tribute.funeralDetails = {
    ...tribute.funeralDetails,
    rsvpList: updatedList,
  };

  return await saveTribute(tribute);
}

export function getMockTributes(): Tribute[] {
  return [
    {
      id: "1",
      createdBy: "mock-user-1",
      name: "Jane Doe",
      birthDate: "1950-01-01",
      deathDate: "2024-05-12",
      bio: "A kind and loving person remembered forever.",
      photoBase64: "/placeholder.jpg",
      obituaryText: "",
      funeralDetails: {
        dateTime: "",
        location: "",
        rsvpLink: "",
        rsvpEnabled: false,
        rsvpList: [],
        notes: "",
      },
      tags: [],
    },
    {
      id: "2",
      createdBy: "mock-user-2",
      name: "John Smith",
      birthDate: "1945-03-22",
      deathDate: "2023-11-04",
      bio: "A life well lived.",
      photoBase64: "/placeholder.jpg",
      obituaryText: "",
      funeralDetails: {
        dateTime: "",
        location: "",
        rsvpLink: "",
        rsvpEnabled: false,
        rsvpList: [],
        notes: "",
      },
      tags: [],
    },
  ];
}
