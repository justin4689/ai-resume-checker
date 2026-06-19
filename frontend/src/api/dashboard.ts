import { mockDashboard } from "@/mock/dashboard";
import { mockDelay } from "@/mock/_helpers";
import type { Dashboard } from "@/types";

export const dashboardApi = {
  get: async (): Promise<Dashboard> => {
    await mockDelay();
    return mockDashboard;
  },
};
