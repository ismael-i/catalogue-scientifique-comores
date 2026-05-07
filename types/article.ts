// ── Article (fil info) ───────────────────────────────────────────────

export interface Article {
  id: string
  date: string                    // formatted French date, e.g. "15 mars 2025"
  title: string
  description: string             // short summary used on cards
  imageUrl?: string               // cover image (optional)
  imageAlt?: string
  tags: string[]
  body: string[]                  // body paragraphs (detail page)
  authorName: string
  authorPhotoUrl?: string
  laboratoryAcronym?: string
  laboratoryName?: string
}

export interface ArticleCardProps extends Article {}
