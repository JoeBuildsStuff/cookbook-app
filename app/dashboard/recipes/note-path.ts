export function slugifyTitle(title: string): string {
  const trimmed = title.trim().toLowerCase();
  const slug = trimmed
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || "untitled-note";
}

export function documentPathToSlug(documentPath: string): string {
  return documentPath.replace(/^\/+/, "");
}

export function slugToDocumentPath(slug: string): string {
  return `/${slug.replace(/^\/+/, "")}`;
}

export function createUniqueSlug(baseTitle: string, existingDocumentPaths: string[]): string {
  const baseSlug = slugifyTitle(baseTitle);
  const existingSlugs = new Set(existingDocumentPaths.map(documentPathToSlug));

  if (!existingSlugs.has(baseSlug)) {
    return baseSlug;
  }

  let index = 2;
  let candidate = `${baseSlug}-${index}`;

  while (existingSlugs.has(candidate)) {
    index += 1;
    candidate = `${baseSlug}-${index}`;
  }

  return candidate;
}

export function formatNoteIdBadge(noteId: string): string {
  const compactId = noteId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const first = compactId.slice(0, 3);
  const second = compactId.slice(3, 6);

  if (!first) {
    return '';
  }

  return second ? `${first}_${second}` : first;
}
