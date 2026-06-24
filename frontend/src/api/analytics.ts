import { api } from './client';
import type { Insights, AllVersions, History } from '@/types';

export const analyticsApi = {
  insights: () => api.get<Insights>('/analytics/insights'),
  versions: () => api.get<AllVersions>('/analytics/versions'),
  history:  () => api.get<History>('/analytics/history'),
};
