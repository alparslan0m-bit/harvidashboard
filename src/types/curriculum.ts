import type { Year, Module, Subject, Lecture } from "./database";

export type YearWithCount = Year & { modulesCount: number };

export type ModuleWithCount = Module & { subjectsCount: number };

export type SubjectWithLectures = Subject & { lectures: Lecture[] };

export type ReorderPayload = { id: string; order_index: number };

export interface CurriculumModulePayload {
  name: string;
  price_cents: number;
}

export interface CurriculumSubjectPayload {
  name: string;
}

export interface CurriculumLecturePayload {
  subjectId: string;
  name: string;
  is_free?: boolean;
}
