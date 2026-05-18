type JsonLdData = Record<string, unknown> | Record<string, unknown>[];

interface JsonLdProps {
  data: JsonLdData;
}

function withoutContext(item: Record<string, unknown>) {
  const payload = { ...item };
  delete payload['@context'];
  return payload;
}

export function JsonLd({ data }: JsonLdProps) {
  const payload = Array.isArray(data)
    ? {
        '@context': 'https://schema.org',
        '@graph': data.map(withoutContext),
      }
    : { '@context': 'https://schema.org', ...data };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
