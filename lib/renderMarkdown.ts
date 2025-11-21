import { marked } from "marked"
import DOMPurify from "isomorphic-dompurify"

export function renderMarkdown(md: string) {
  const html = marked(md, { gfm: true })
  return DOMPurify.sanitize(html)
}
