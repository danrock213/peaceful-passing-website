import { Tribute, RSVP } from "@/types/tribute";

export const tributes: Tribute[] = [
  {
    id: "1",
    createdBy: "mock-user-1",
    name: "Jane Doe",
    birthDate: "1950-01-01",
    deathDate: "2024-05-12",
    bio: "A kind and loving person remembered forever.",
    story: "",
    photoUrl: "/placeholder.jpg",
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
    story: "",
    photoUrl: "/placeholder.jpg",
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

export function getTributeById(id: string): Tribute | undefined {
  return tributes.find((t) => t.id === id);
}

export async function saveTribute(tribute: Tribute): Promise<Tribute> {
  const index = tributes.findIndex((t) => t.id === tribute.id);
  if (index !== -1) {
    tributes[index] = tribute;
  } else {
    tributes.push(tribute);
  }
  return tribute;
}

export async function deleteTribute(id: string): Promise<boolean> {
  const index = tributes.findIndex((t) => t.id === id);
  if (index !== -1) {
    tributes.splice(index, 1);
    return true;
  }
  return false;
}

export async function addRSVPToTribute(id: string, rsvp: RSVP): Promise<Tribute | undefined> {
  const tribute = getTributeById(id);
  if (!tribute) return undefined;

  if (!tribute.funeralDetails) {
    tribute.funeralDetails = {
      dateTime: "",
      location: "",
      rsvpLink: "",
      rsvpEnabled: false,
      rsvpList: [],
      notes: "",
    };
  }
  if (!tribute.funeralDetails.rsvpList) {
    tribute.funeralDetails.rsvpList = [];
  }

  tribute.funeralDetails.rsvpList.push(rsvp);
  return tribute;
}
