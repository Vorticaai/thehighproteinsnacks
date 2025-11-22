import { marked } from "marked"
import DOMPurify from "isomorphic-dompurify"

export function renderMarkdown(md: string) {
  const parsed = marked.parse(md, { gfm: true })
  const html = typeof parsed === "string" ? parsed : ""
  return DOMPurify.sanitize(html)
}
