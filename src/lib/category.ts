export function categoryToSlug(category: string): string {
  return category
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function categoryUrl(category: string): string {
  return `/category/${categoryToSlug(category)}`;
}
