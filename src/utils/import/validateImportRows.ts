import type { CsvRow, ValidationResult } from "@/types/import";

export function validateImportRows(rows: CsvRow[]): ValidationResult[] {
  return rows.map((row, idx) => {
    const rowNumber = idx + 2; // header is row 1
    const errorsList: string[] = [];

    // Required fields
    if (!row.year_name?.trim()) errorsList.push("Missing 'year_name'");
    if (!row.module_name?.trim()) errorsList.push("Missing 'module_name'");
    if (!row.subject_name?.trim()) errorsList.push("Missing 'subject_name'");
    if (!row.lecture_name?.trim()) errorsList.push("Missing 'lecture_name'");
    if (!row.question_text?.trim()) errorsList.push("Missing 'question_text'");
    if (!row.option_1?.trim()) errorsList.push("Missing 'option_1'");
    if (!row.option_2?.trim()) errorsList.push("Missing 'option_2'");
    if (row.correct_answer_index === undefined || row.correct_answer_index === "") {
      errorsList.push("Missing 'correct_answer_index'");
    }

    // Length validations
    if (row.question_text && row.question_text.length > 1000) {
      errorsList.push("question_text exceeds 1000 characters limit");
    }

    // Check correct answer index is numeric 0-5
    const correctIdx = parseInt(row.correct_answer_index, 10);
    if (isNaN(correctIdx) || correctIdx < 0 || correctIdx > 5) {
      errorsList.push("correct_answer_index must be a number 0 to 5");
    } else {
      // Must not exceed the number of populated options
      const optionColumns = [
        row.option_1,
        row.option_2,
        row.option_3,
        row.option_4,
        row.option_5,
        row.option_6,
      ];
      const populatedOptionsCount = optionColumns.filter((o) => o && o.trim() !== "").length;
      if (correctIdx >= populatedOptionsCount) {
        errorsList.push(
          `correct_answer_index (${correctIdx}) exceeds available options count (${populatedOptionsCount})`
        );
      }
    }

    // Image URL validations
    if (row.image_url && row.image_url.trim() !== "") {
      const urlStr = row.image_url.trim();
      if (!urlStr.startsWith("http://") && !urlStr.startsWith("https://")) {
        errorsList.push("image_url must start with http:// or https://");
      }
    }

    return {
      rowNumber,
      isValid: errorsList.length === 0,
      errors: errorsList,
      rowData: row,
    };
  });
}
