import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

const MARKDOWN_HTML_TAG_PATTERN = /<\/?[a-z][\s\S]*>/i;
const ALLOWED_TEXT_ALIGN = [/^left$/, /^right$/, /^center$/, /^justify$/];

export const NOTE_ALLOWED_TAGS = [
  "p",
  "br",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
  "pre",
  "code",
  "ul",
  "ol",
  "li",
  "strong",
  "em",
  "s",
  "u",
  "a",
  "hr",
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "th",
  "td",
  "img",
  "div",
  "span",
];

function looksLikeHtml(content: string): boolean {
  return MARKDOWN_HTML_TAG_PATTERN.test(content);
}

/**
 * Normalizes note/recipe content for safe storage. Accepts Markdown or HTML;
 * Markdown is parsed to HTML, then the result is sanitized before saving.
 */
export async function normalizeNoteContent(content: string): Promise<string> {
  const trimmed = content.trim();
  if (!trimmed) {
    return "";
  }

  const renderedHtml = looksLikeHtml(trimmed)
    ? trimmed
    : await marked.parse(trimmed, { gfm: true, breaks: true });

  return sanitizeHtml(renderedHtml, {
    allowedTags: NOTE_ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "class"],
      pre: ["class"],
      code: ["class"],
      p: ["style"],
      h1: ["style"],
      h2: ["style"],
      h3: ["style"],
      h4: ["style"],
      h5: ["style"],
      h6: ["style"],
      th: ["colspan", "rowspan"],
      td: ["colspan", "rowspan"],
      div: [
        "class",
        "data-type",
        "data-src",
        "data-filename",
        "data-file-size",
        "data-file-type",
        "data-upload-status",
        "data-preview-type",
      ],
      span: ["class"],
    },
    allowedStyles: {
      p: { "text-align": ALLOWED_TEXT_ALIGN },
      h1: { "text-align": ALLOWED_TEXT_ALIGN },
      h2: { "text-align": ALLOWED_TEXT_ALIGN },
      h3: { "text-align": ALLOWED_TEXT_ALIGN },
      h4: { "text-align": ALLOWED_TEXT_ALIGN },
      h5: { "text-align": ALLOWED_TEXT_ALIGN },
      h6: { "text-align": ALLOWED_TEXT_ALIGN },
    },
    allowedSchemes: ["http", "https", "mailto", "data"],
    allowedSchemesByTag: {
      img: ["http", "https", "data"],
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer",
        target: "_blank",
      }),
    },
  });
}
