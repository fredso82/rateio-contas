type InlineExpenseComposerPeriod = {
  isHistoricalView: boolean;
  canCreateExpense: boolean;
};

export function shouldShowInlineExpenseComposer(
  period: InlineExpenseComposerPeriod | null,
) {
  if (!period) {
    return false;
  }

  return !period.isHistoricalView && period.canCreateExpense;
}
