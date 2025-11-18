/**
 * Reusable ItemList schema component for JSON-LD structured data.
 * Outputs @type: "ItemList" using a script tag.
 */
type ItemListSchemaProps = {
  items: Array<{
    name: string
    url: string
  }>
}

export function ItemListSchema({ items }: ItemListSchemaProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}


