export const generateId = (prefix: string) => {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}_${Date.now().toString(36).toUpperCase()}_${random}`;
};

export const generateJoinCode = (existing: Set<string>) => {
  let code = "";
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  while (!code || existing.has(code)) {
    const part = Array.from({ length: 6 })
      .map(() => chars[Math.floor(Math.random() * chars.length)])
      .join("");
    code = `FAM-${part}`;
  }
  return code;
};
