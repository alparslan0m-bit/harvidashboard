import type { Year, Module, Subject, Lecture } from "./database";

export type YearWithCount = Year & { modulesCount: number };

export type ModuleWithCount = Module & { subjectsCount: number };

export type SubjectWithLectures = Subject & { lectures: Lecture[] };

export type ReorderPayload = { id: string; order_index: number };

export interface CurriculumFormPayload {
  name: string;
  is_free: boolean;
  price_cents: number;
}

export interface CurriculumUpdatePayload extends CurriculumFormPayload {
  id: string;
}
