export function findYouTubeURL(str: string): string | null {
  const result = str.match(/^https:\/\/music.youtube.com\/watch\?v=([a-zA-Z0-9_]+).*$/)

  if (result === null) return null
  return result[1]
}