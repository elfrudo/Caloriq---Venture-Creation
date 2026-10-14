export const rupiah = (n: number) => `Rp${Math.round(n).toLocaleString("id-ID")}`;
export const splitList = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
