import * as zod from "zod";

export const questionFormSchema = zod.object({
  lecture_id: zod.string().min(1, "Lecture is required"),
  text: zod.string().min(1, "Question text is required").max(1000, "Must be under 1000 chars"),
  image_url: zod.string().url("Must be a valid URL").or(zod.literal("")).optional(),
  options: zod
    .array(zod.string().min(1, "Option text cannot be empty"))
    .min(2, "Minimum 2 options required")
    .max(6, "Maximum 6 options allowed"),
  correct_answer_index: zod.number().min(0).max(5),
  explanation: zod.string().optional(),
});

export type QuestionFormValues = zod.infer<typeof questionFormSchema>;
