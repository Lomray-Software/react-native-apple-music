export const getErrorMessage = (error: unknown): string => {
  const e = error as { message?: string };

  if (typeof e?.message === 'string' && e.message.trim().length > 0) {
    return e.message;
  }

  return 'Authorization failed';
};
