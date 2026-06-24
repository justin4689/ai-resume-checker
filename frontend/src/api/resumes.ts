import { api } from './client';
import type { ResumeShallow, Resume, ResumeVersion, Analysis, DiffHunk } from '@/types';

export const resumesApi = {
  list: () =>
    api.get<{ resumes: ResumeShallow[] }>('/resumes'),

  get: (id: string) =>
    api.get<{ resume: Omit<Resume, 'versions'>; versions: ResumeVersion[] }>(`/resumes/${id}`),

  getVersion: (id: string, versionId: string) =>
    api.get<{ version: ResumeVersion }>(`/resumes/${id}/versions/${versionId}`),

  upload: (file: File | null, title?: string) => {
    const form = new FormData();
    if (file) form.append('file', file);
    if (title) form.append('title', title);
    return api.post<{ resume: Partial<Resume> }>('/resumes', form);
  },

  remove: (id?: string) =>
    api.delete<{ ok: boolean }>(`/resumes/${id}`),

  analyze: (id: string, body: Record<string, unknown>) =>
    api.post<{ analysis: Analysis }>(`/resumes/${id}/analyze`, body),

  analyses: (id: string) =>
    api.get<{ analyses: Analysis[] }>(`/resumes/${id}/analyses`),

  analysisForVersion: (id: string, versionId: string) =>
    api.get<{ analysis: Analysis }>(`/resumes/${id}/versions/${versionId}/analysis`),

  rewrite: (id: string, body: Record<string, unknown>) =>
    api.post<{ version: ResumeVersion; appliedCount: number }>(`/resumes/${id}/rewrite`, body),

  diff: (id: string, from: string, to: string, mode = 'words') =>
    api.get<{ hunks: DiffHunk[] }>(`/resumes/${id}/diff?from=${from}&to=${to}&mode=${mode}`),
};
