export const isLibraryItem = (id: string): boolean =>
  // Library items typically start with 'i.' or 'l.' or contain non-numeric characters
  /^[a-z]\./.test(id) || !/^\d+$/.test(id);
