import { mockInsights, mockAllVersions, mockHistory } from "@/mock/analytics";
import { mockDelay } from "@/mock/_helpers";
import type { Insights, AllVersions, History } from "@/types";

export const analyticsApi = {
  insights: async (): Promise<Insights> => {
    await mockDelay();
    return mockInsights;
  },

  versions: async (): Promise<AllVersions> => {
    await mockDelay();
    return mockAllVersions;
  },

  history: async (): Promise<History> => {
    await mockDelay();
    return mockHistory;
  },
};
