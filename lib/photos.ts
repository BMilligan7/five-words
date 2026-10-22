export type PhotoResponse = { id: string; words: string[]; updatedAt: string };
export type Photo = { id: string; name: string; fileName: string; shareToken: string | null; createdAt: string; responses: PhotoResponse[] };
export function wordCounts(photo: Photo) {
  const counts = new Map<string, number>();
  for (const response of photo.responses) for (const word of new Set(response.words.map(word => word.toLocaleLowerCase()))) counts.set(word, (counts.get(word) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}
