import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { ImportErrorLogEntry, ImportSummary, ValidationResult } from "@/types/import";

export interface ImportQuestionsCallbacks {
  onProgress: (percent: number) => void;
  onError: (entry: ImportErrorLogEntry) => void;
}

export async function importQuestions(
  validRows: ValidationResult[],
  callbacks: ImportQuestionsCallbacks
): Promise<ImportSummary> {
  const batchSize = 10;
  const totalValid = validRows.length;
  let questionsImported = 0;
  let lecturesCreated = 0;
  let subjectsCreated = 0;
  let modulesCreated = 0;
  let yearsCreated = 0;

  const yearsCache: Record<string, string> = {};
  const modulesCache: Record<string, string> = {};
  const subjectsCache: Record<string, string> = {};
  const lecturesCache: Record<string, string> = {};

  for (let i = 0; i < totalValid; i += batchSize) {
    const batch = validRows.slice(i, i + batchSize);

    const promises = batch.map(async ({ rowData, rowNumber }) => {
      try {
        const yName = rowData.year_name.trim();
        const mName = rowData.module_name.trim();
        const sName = rowData.subject_name.trim();
        const lName = rowData.lecture_name.trim();

        let yearId = yearsCache[yName];
        if (!yearId) {
          const { data: extY } = await supabaseAdmin
            .from("years")
            .select("id")
            .eq("name", yName)
            .maybeSingle();

          if (extY) {
            yearId = extY.id;
          } else {
            const { data: newY, error: yErr } = await supabaseAdmin
              .from("years")
              .insert({ name: yName })
              .select("id")
              .single();
            if (yErr) throw yErr;
            yearId = newY.id;
            yearsCreated++;
          }
          yearsCache[yName] = yearId;
        }

        const modKey = `${yearId}:${mName}`;
        let moduleId = modulesCache[modKey];
        if (!moduleId) {
          const { data: extM } = await supabaseAdmin
            .from("modules")
            .select("id")
            .eq("year_id", yearId)
            .eq("name", mName)
            .maybeSingle();

          if (extM) {
            moduleId = extM.id;
          } else {
            const { data: newM, error: mErr } = await supabaseAdmin
              .from("modules")
              .insert({ year_id: yearId, name: mName, is_free: true })
              .select("id")
              .single();
            if (mErr) throw mErr;
            moduleId = newM.id;
            modulesCreated++;
          }
          modulesCache[modKey] = moduleId;
        }

        const subjKey = `${moduleId}:${sName}`;
        let subjectId = subjectsCache[subjKey];
        if (!subjectId) {
          const { data: extS } = await supabaseAdmin
            .from("subjects")
            .select("id")
            .eq("module_id", moduleId)
            .eq("name", sName)
            .maybeSingle();

          if (extS) {
            subjectId = extS.id;
          } else {
            const { data: newS, error: sErr } = await supabaseAdmin
              .from("subjects")
              .insert({ module_id: moduleId, name: sName, is_free: true })
              .select("id")
              .single();
            if (sErr) throw sErr;
            subjectId = newS.id;
            subjectsCreated++;
          }
          subjectsCache[subjKey] = subjectId;
        }

        const lectKey = `${subjectId}:${lName}`;
        let lectureId = lecturesCache[lectKey];
        if (!lectureId) {
          const { data: extL } = await supabaseAdmin
            .from("lectures")
            .select("id")
            .eq("subject_id", subjectId)
            .eq("name", lName)
            .maybeSingle();

          if (extL) {
            lectureId = extL.id;
          } else {
            const { data: newL, error: lErr } = await supabaseAdmin
              .from("lectures")
              .insert({ subject_id: subjectId, name: lName })
              .select("id")
              .single();
            if (lErr) throw lErr;
            lectureId = newL.id;
            lecturesCreated++;
          }
          lecturesCache[lectKey] = lectureId;
        }

        const optionsArray = [
          rowData.option_1,
          rowData.option_2,
          rowData.option_3,
          rowData.option_4,
          rowData.option_5,
          rowData.option_6,
        ].filter((o) => o && o.trim() !== "");

        const { error: qErr } = await supabaseAdmin.from("questions").insert({
          lecture_id: lectureId,
          text: rowData.question_text.trim(),
          image_url: rowData.image_url?.trim() || null,
          options: optionsArray,
          correct_answer_index: parseInt(rowData.correct_answer_index, 10),
          explanation: rowData.explanation?.trim() || null,
        });

        if (qErr) throw qErr;
        questionsImported++;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        callbacks.onError({ row: rowNumber, error: message });
      }
    });

    await Promise.all(promises);

    const progressPercent = Math.min(Math.round(((i + batch.length) / totalValid) * 100), 100);
    callbacks.onProgress(progressPercent);
  }

  return {
    questionsCount: questionsImported,
    lecturesCreated,
    subjectsCreated,
    modulesCreated,
    yearsCreated,
  };
}
