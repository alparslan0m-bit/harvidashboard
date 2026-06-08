export function expandFeedbackRows<
  T extends { id: string; content: string; metadata?: Record<string, unknown> },
>(feedbackList: T[], expandedRowId: string | null) {
  return feedbackList.flatMap((item) => {
    if (expandedRowId === item.id) {
      return [
        item,
        {
          id: `${item.id}-expansion`,
          isExpansionRow: true,
          content: item.content,
          metadata: item.metadata,
        },
      ];
    }
    return [item];
  });
}
