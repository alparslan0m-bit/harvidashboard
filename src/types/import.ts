export interface CsvRow {
  year_name: string;
  module_name: string;
  subject_name: string;
  lecture_name: string;
  question_text: string;
  option_1: string;
  option_2: string;
  option_3?: string;
  option_4?: string;
  option_5?: string;
  option_6?: string;
  correct_answer_index: string;
  explanation?: string;
  image_url?: string;
}

export interface ValidationResult {
  rowNumber: number;
  isValid: boolean;
  errors: string[];
  rowData: CsvRow;
}

export interface ImportSummary {
  questionsCount: number;
  lecturesCreated: number;
  subjectsCreated: number;
  modulesCreated: number;
  yearsCreated: number;
}

export interface ImportErrorLogEntry {
  row: number;
  error: string;
}
