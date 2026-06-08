import { useSubjects } from "./useSubjects";
import { useLectureMutations } from "./useLectureMutations";

export function useSubjectsAndLectures(moduleId: string | null) {
  const subjectState = useSubjects(moduleId);
  const lectureMutations = useLectureMutations(moduleId);
  return { ...subjectState, ...lectureMutations };
}
