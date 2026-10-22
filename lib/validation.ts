export const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
export function imageContentType(bytes: Uint8Array): string | null {
  const starts = (values: number[]) => values.every((value, index) => bytes[index] === value);
  const text = (offset: number, value: string) => [...value].every((char, index) => bytes[offset + index] === char.charCodeAt(0));
  if (bytes.length < 32) return null;
  if (starts([0xff, 0xd8, 0xff]) && bytes.at(-2) === 0xff && bytes.at(-1) === 0xd9) return "image/jpeg";
  if (starts([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]) && text(12, "IHDR") && text(bytes.length - 8, "IEND")) return "image/png";
  if (text(0, "RIFF") && text(8, "WEBP") && new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(4, true) + 8 === bytes.length) return "image/webp";
  return null;
}
export function validateWords(input: unknown): string[] {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Add five descriptive words.");
  const { words } = input as Record<string, unknown>;
  if (!Array.isArray(words) || words.length !== 5) throw new Error("Add exactly five descriptive words.");
  const result = words.map(value => {
    if (typeof value !== "string" || !value.trim() || value.trim().length > 40) throw new Error("Keep each word between 1 and 40 characters.");
    const word = value.trim().normalize("NFC");
    if (!/^[\p{L}\p{M}]+(?:[-’'][\p{L}\p{M}]+)*$/u.test(word)) throw new Error("Use one descriptive word per field. Hyphenated words are welcome.");
    return word;
  });
  if (new Set(result.map(word => word.toLocaleLowerCase())).size !== 5) throw new Error("Use a different word in each field.");
  return result;
}
