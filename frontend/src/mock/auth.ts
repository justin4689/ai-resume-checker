import { daysAgo } from "./_helpers";
import type { User } from "@/types";

export const mockUser: User = {
  _id: "user_1",
  name: "Alex Carter",
  email: "alex@timetoprogram.com",
  createdAt: daysAgo(45),
};

const STORAGE_KEY = "arr-mock-user";

export function loadMockUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function saveMockUser(u: User | null): void {
  if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
  else localStorage.removeItem(STORAGE_KEY);
}
