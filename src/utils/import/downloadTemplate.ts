export function downloadTemplate(): void {
  const headers = [
    "year_name",
    "module_name",
    "subject_name",
    "lecture_name",
    "question_text",
    "option_1",
    "option_2",
    "option_3",
    "option_4",
    "option_5",
    "option_6",
    "correct_answer_index",
    "explanation",
    "image_url",
  ];

  const sampleRow = [
    "Year 1",
    "Cardiovascular System",
    "Cardiology",
    "Heart Murmurs",
    "Which murmur is heard best at the apex in left lateral decubitus position?",
    "Mitral Stenosis",
    "Aortic Regurgitation",
    "Mitral Regurgitation",
    "Aortic Stenosis",
    "",
    "",
    "0",
    "Mitral stenosis is a diastolic murmur heard best at the cardiac apex in left lateral position.",
    "https://example.com/diagram.png",
  ];

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers, sampleRow].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "harvi_questions_template.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
