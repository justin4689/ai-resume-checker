import { mockUser, loadMockUser, saveMockUser } from "@/mock/auth";
import { mockDelay } from "@/mock/_helpers";
import type { User } from "@/types";

interface RegisterPayload { name?: string; email?: string; password?: string }
interface LoginPayload { email?: string; password?: string }
interface UpdateProfilePayload { name?: string; email?: string }
interface ChangePasswordPayload { currentPassword?: string; newPassword?: string }

export const authApi = {
  register: async ({ name, email }: RegisterPayload): Promise<{ user: User }> => {
    await mockDelay();
    const u: User = { ...mockUser, name: name || mockUser.name, email: email || mockUser.email };
    saveMockUser(u);
    return { user: u };
  },

  login: async ({ email }: LoginPayload): Promise<{ user: User }> => {
    await mockDelay();
    const u: User = { ...mockUser, email: email || mockUser.email };
    saveMockUser(u);
    return { user: u };
  },

  logout: async (): Promise<{ ok: boolean }> => {
    await mockDelay(150);
    saveMockUser(null);
    return { ok: true };
  },

  me: async (): Promise<{ user: User }> => {
    await mockDelay(150);
    const u = loadMockUser();
    if (!u) {
      throw { status: 401, message: "Not authenticated" };
    }
    return { user: u };
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<{ user: User }> => {
    await mockDelay();
    const current = loadMockUser() || mockUser;
    const u: User = { ...current, ...payload };
    saveMockUser(u);
    return { user: u };
  },

  changePassword: async (_payload?: ChangePasswordPayload): Promise<{ ok: boolean }> => {
    await mockDelay();
    return { ok: true };
  },
};
