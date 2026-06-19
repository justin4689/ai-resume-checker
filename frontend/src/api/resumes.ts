import {
  mockResumes,
  mockAnalyses,
  findMockResume,
  listMockResumesShallow,
} from "@/mock/resumes";
import { mockDelay } from "@/mock/_helpers";
import type { ResumeShallow, Resume, ResumeVersion, Analysis, DiffHunk } from "@/types";

export const resumesApi = {
  list: async (): Promise<{ resumes: ResumeShallow[] }> => {
    await mockDelay();
    return { resumes: listMockResumesShallow() };
  },

  get: async (id: string): Promise<{ resume: Omit<Resume, "versions">; versions: ResumeVersion[] }> => {
    await mockDelay();
    const resume = findMockResume(id);
    if (!resume) throw { status: 404, message: "Resume not found" };
    return {
      resume: {
        _id: resume._id,
        title: resume.title,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
        currentVersionId: resume.currentVersionId,
        bestScore: resume.bestScore,
        versionCount: resume.versionCount,
      },
      versions: resume.versions,
    };
  },

  getVersion: async (_id: string, versionId: string): Promise<{ version: ResumeVersion }> => {
    await mockDelay();
    const resume = findMockResume(_id);
    const version = resume?.versions.find((v) => v._id === versionId);
    if (!version) throw { status: 404, message: "Version not found" };
    return { version };
  },

  upload: async (file: File | null, title?: string): Promise<{ resume: Partial<Resume> }> => {
    await mockDelay(800);
    const resume = mockResumes[0];
    return {
      resume: { ...resume, title: title || file?.name || resume.title },
    };
  },

  remove: async (_id?: string): Promise<{ ok: boolean }> => {
    await mockDelay();
    return { ok: true };
  },

  analyze: async (_id: string, { versionId }: { versionId?: string } = {}): Promise<{ analysis: Analysis }> => {
    await mockDelay(1200);
    const analysis =
      (versionId ? mockAnalyses[versionId] : undefined) || mockAnalyses[Object.keys(mockAnalyses)[0]];
    return { analysis };
  },

  analyses: async (id: string): Promise<{ analyses: Analysis[] }> => {
    await mockDelay();
    const resume = findMockResume(id);
    const analyses = (resume?.versions || [])
      .map((v) => mockAnalyses[v._id])
      .filter(Boolean) as Analysis[];
    return { analyses };
  },

  analysisForVersion: async (_id: string, versionId: string): Promise<{ analysis: Analysis }> => {
    await mockDelay();
    const analysis = mockAnalyses[versionId];
    if (!analysis) throw { status: 404, message: "No analysis for this version" };
    return { analysis };
  },

  rewrite: async (id: string, { rewriteIds = [] }: { rewriteIds?: string[]; analysisId?: string } = {}): Promise<{ version: ResumeVersion | undefined; appliedCount: number }> => {
    await mockDelay(900);
    const resume = findMockResume(id);
    const latest = resume?.versions[resume.versions.length - 1];
    return {
      version: latest,
      appliedCount: rewriteIds.length || 4,
    };
  },

  diff: async (_id?: string, _from?: string, _to?: string, _mode?: string): Promise<{ hunks: DiffHunk[] }> => {
    await mockDelay();
    return {
      hunks: [
        { type: "remove", text: "Worked on dashboards for the analytics team." },
        { type: "add", text: "Shipped 4 React analytics dashboards adopted by 12k+ daily users — cut load time 38%." },
        { type: "context", text: "Led migration from Webpack to Vite — build times down from 92s to 11s." },
        { type: "remove", text: "Helped migrate the build system." },
        { type: "add", text: "Owned design-system rewrite (40+ components, full WCAG AA pass)." },
      ],
    };
  },
};
