export const REGEXP = {
  MARKDOWN_IMAGE: /!\[([^\]]*)]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g,
  EXTERNAL_URL: /^https?:\/\//i,
} as const;
