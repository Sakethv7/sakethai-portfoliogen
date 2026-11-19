// Address of the Writing list for a kind and a tag (ADR-049). The tag is URL-encoded because some
// tags hold spaces or slashes. An empty value leaves that filter out.
export function writingHref(kind: string, tag: string): string {
  const query = [kind && `kind=${kind}`, tag && `tag=${encodeURIComponent(tag)}`].filter(Boolean).join('&');
  return `/writing${query ? `?${query}` : ''}`;
}
