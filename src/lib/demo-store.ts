"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { analyzeAiResultToDemoData } from "./ai/transforms";
import type { AnalyzeMaterialAIResult } from "./ai/schemas";
import {
  defaultSelfAssessments,
  defaultWeekSelfAssessments,
  generateMockWeekFeedback,
  initialUnderstandingLevels,
  mockKnowledgeSnapshots,
  mockMaterials,
  mockRecallRecords,
  mockWeekFeedbackById,
  mockWeeks,
} from "./mock-data";
import type {
  FeedbackResult,
  MapMode,
  MapSnapshot,
  RecallDifficulty,
  RecallLevel,
  RecallRecord,
  SelfAssessment,
  StudyWeek,
  UnderstandingLevel,
  WeekConcept,
  WeekFeedbackResult,
  WeekMaterial,
} from "./types";

interface DemoState {
  selectedMaterialId: string;
  selfAssessments: SelfAssessment[];
  selectedConceptId: string;
  recallLevel: RecallLevel;
  recallAnswer: string;
  feedbackResult: FeedbackResult | null;
  understandingLevels: Record<string, UnderstandingLevel>;
  reviewCount: number;

  setSelectedMaterialId: (id: string) => void;
  toggleSelfAssessment: (conceptId: string) => void;
  setSelectedConceptId: (id: string) => void;
  setRecallLevel: (level: RecallLevel) => void;
  setRecallAnswer: (text: string) => void;
  submitFeedback: (feedback: FeedbackResult) => void;
  resetRecall: () => void;

  // ---- 주차 중심 상태 (최종 수정사항) ----
  selectedSubjectId: string;
  selectedWeekId: string | null;
  selectedMapMode: MapMode;
  selectedSnapshotIndex: number;
  weeks: StudyWeek[];
  weekSelfAssessments: Record<string, SelfAssessment[]>;
  recallDifficulty: RecallDifficulty;
  weekRecallAnswer: string;
  verificationAnswers: Record<string, string>;
  currentWeekFeedback: WeekFeedbackResult | null;
  recallRecords: RecallRecord[];
  mapSnapshots: MapSnapshot[];
  feedbackById: Record<string, WeekFeedbackResult>;
  aiWeekConceptsByWeekId: Record<string, WeekConcept[]>;
  aiMaterialsByWeekId: Record<string, WeekMaterial[]>;
  aiKeywordsByWeekId: Record<string, [string, string, string]>;

  selectSubject: (subjectId: string) => void;
  selectWeek: (weekId: string | null) => void;
  setMapMode: (mode: MapMode) => void;
  setSnapshotIndex: (index: number) => void;
  toggleWeekSelfAssessment: (weekId: string, conceptId: string) => void;
  setRecallDifficulty: (difficulty: RecallDifficulty) => void;
  setWeekRecallAnswer: (text: string) => void;
  setVerificationAnswer: (questionId: string, text: string) => void;
  resetCurrentRecall: () => void;
  submitWeekRecall: (weekId: string) => void;
  setCurrentWeekFeedback: (feedback: WeekFeedbackResult) => void;
  applyVerifiedWeekFeedback: (feedback: WeekFeedbackResult) => void;
  saveRecallRecord: () => void;
  saveMaterialAnalysis: (input: {
    subjectId: string;
    fileName: string;
    mimeType: string;
    analysis: AnalyzeMaterialAIResult;
  }) => string;
}

export const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => ({
      selectedMaterialId: mockMaterials[0].id,
      selfAssessments: defaultSelfAssessments,
      selectedConceptId: "false-representation",
      recallLevel: 2,
      recallAnswer: "",
      feedbackResult: null,
      understandingLevels: initialUnderstandingLevels,
      reviewCount: 0,

      setSelectedMaterialId: (id) => set({ selectedMaterialId: id }),

      toggleSelfAssessment: (conceptId) => {
        const current = get().selfAssessments;
        const existing = current.find((a) => a.conceptId === conceptId);
        if (existing) {
          set({
            selfAssessments: current.map((a) =>
              a.conceptId === conceptId
                ? { ...a, predictedKnown: !a.predictedKnown }
                : a
            ),
          });
        } else {
          set({
            selfAssessments: [...current, { conceptId, predictedKnown: true }],
          });
        }
      },

      setSelectedConceptId: (id) => set({ selectedConceptId: id }),
      setRecallLevel: (level) => set({ recallLevel: level }),
      setRecallAnswer: (text) => set({ recallAnswer: text }),

      submitFeedback: (feedback) =>
        set((state) => ({
          feedbackResult: feedback,
          understandingLevels: {
            ...state.understandingLevels,
            ...feedback.understandingLevelByConcept,
          },
          reviewCount: state.reviewCount + 1,
        })),

      resetRecall: () =>
        set({ recallAnswer: "", feedbackResult: null }),

      // ---- 주차 중심 상태 (최종 수정사항) ----
      selectedSubjectId: "civil-law-general",
      selectedWeekId: null,
      selectedMapMode: "knowledge",
      selectedSnapshotIndex: mockKnowledgeSnapshots.length - 1,
      weeks: mockWeeks,
      weekSelfAssessments: defaultWeekSelfAssessments,
      recallDifficulty: "outline",
      weekRecallAnswer: "",
      verificationAnswers: {},
      currentWeekFeedback: null,
      recallRecords: mockRecallRecords,
      mapSnapshots: mockKnowledgeSnapshots,
      feedbackById: mockWeekFeedbackById,
      aiWeekConceptsByWeekId: {},
      aiMaterialsByWeekId: {},
      aiKeywordsByWeekId: {},

      selectSubject: (subjectId) =>
        set({ selectedSubjectId: subjectId, selectedWeekId: null }),

      selectWeek: (weekId) => set({ selectedWeekId: weekId }),

      setMapMode: (mode) => set({ selectedMapMode: mode }),

      setSnapshotIndex: (index) => set({ selectedSnapshotIndex: index }),

      toggleWeekSelfAssessment: (weekId, conceptId) => {
        const current = get().weekSelfAssessments[weekId] ?? [];
        const existing = current.find((a) => a.conceptId === conceptId);
        const updated = existing
          ? current.map((a) =>
              a.conceptId === conceptId
                ? { ...a, predictedKnown: !a.predictedKnown }
                : a
            )
          : [...current, { conceptId, predictedKnown: true }];
        set({
          weekSelfAssessments: { ...get().weekSelfAssessments, [weekId]: updated },
        });
      },

      setRecallDifficulty: (difficulty) => set({ recallDifficulty: difficulty }),
      setWeekRecallAnswer: (text) => set({ weekRecallAnswer: text }),

      setVerificationAnswer: (questionId, text) =>
        set({
          verificationAnswers: { ...get().verificationAnswers, [questionId]: text },
        }),

      resetCurrentRecall: () =>
        set({
          weekRecallAnswer: "",
          verificationAnswers: {},
          currentWeekFeedback: null,
          recallDifficulty: "outline",
        }),

      submitWeekRecall: (weekId) => {
        const answer = get().weekRecallAnswer;
        if (!weekId || !answer.trim()) return;
        const recordId = `record-${weekId}-${get().recallRecords.length + 1}`;
        const feedback = generateMockWeekFeedback(weekId, answer, recordId);
        set({ currentWeekFeedback: feedback });
      },

      setCurrentWeekFeedback: (feedback) => set({ currentWeekFeedback: feedback }),

      applyVerifiedWeekFeedback: (feedback) => set({ currentWeekFeedback: feedback }),

      saveRecallRecord: () => {
        const state = get();
        const feedback = state.currentWeekFeedback;
        if (!feedback) return;
        const weekId = feedback.weekId;

        const week = state.weeks.find((w) => w.id === weekId);
        if (!week) return;

        const record: RecallRecord = {
          id: feedback.recallRecordId,
          subjectId: week.subjectId,
          weekId,
          difficulty: state.recallDifficulty,
          selfAssessments: state.weekSelfAssessments[weekId] ?? [],
          answerText: state.weekRecallAnswer,
          verificationAnswers: state.verificationAnswers,
          feedbackId: feedback.id,
          submittedAt: new Date().toISOString().slice(0, 10),
        };

        const updatedSnapshots = state.mapSnapshots.map((snapshot, index) => {
          const isLastForSubject =
            snapshot.subjectId === week.subjectId &&
            index ===
              state.mapSnapshots
                .map((s, i) => (s.subjectId === week.subjectId ? i : -1))
                .filter((i) => i >= 0)
                .pop();
          if (!isLastForSubject) return snapshot;
          const tiles = { ...snapshot.tilesByConceptId };
          for (const [conceptId, status] of Object.entries(feedback.statusByConceptId)) {
            tiles[conceptId] = {
              conceptId,
              status,
              metacognitionGap: tiles[conceptId]?.metacognitionGap ?? null,
            };
          }
          return { ...snapshot, tilesByConceptId: tiles };
        });

        set({
          recallRecords: [...state.recallRecords, record],
          weeks: state.weeks.map((w) =>
            w.id === weekId ? { ...w, reviewCount: w.reviewCount + 1 } : w
          ),
          mapSnapshots: updatedSnapshots,
          selectedSnapshotIndex: updatedSnapshots.length - 1,
          feedbackById: { ...state.feedbackById, [feedback.id]: feedback },
        });
      },

      saveMaterialAnalysis: ({ subjectId, fileName, mimeType, analysis }) => {
        const state = get();
        const converted = analyzeAiResultToDemoData({ ai: analysis, subjectId, fileName, mimeType });
        const existingWeek = state.weeks.find((week) => week.id === converted.week.id);
        const existingMaterials = state.aiMaterialsByWeekId[converted.week.id] ?? [];
        const staticMaterialIds = existingWeek?.materialIds ?? [];
        const materialIds = Array.from(
          new Set([...staticMaterialIds, ...existingMaterials.map((m) => m.id), converted.material.id])
        );

        const weeks = existingWeek
          ? state.weeks.map((week) =>
              week.id === converted.week.id
                ? { ...week, title: converted.week.title, materialIds }
                : week
            )
          : [...state.weeks, { ...converted.week, materialIds }];

        set({
          weeks,
          aiWeekConceptsByWeekId: {
            ...state.aiWeekConceptsByWeekId,
            [converted.week.id]: converted.concepts,
          },
          aiMaterialsByWeekId: {
            ...state.aiMaterialsByWeekId,
            [converted.week.id]: [...existingMaterials, converted.material],
          },
          aiKeywordsByWeekId: {
            ...state.aiKeywordsByWeekId,
            [converted.week.id]: converted.keywords,
          },
          mapSnapshots: [...state.mapSnapshots, converted.snapshot],
          selectedSnapshotIndex: state.mapSnapshots.length,
          selectedSubjectId: subjectId,
          selectedWeekId: converted.week.id,
        });

        return converted.week.id;
      },
    }),
    { name: "lexirecall-demo-store-v2" }
  )
);
