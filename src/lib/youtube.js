/**
 * Extract a YouTube video ID from any of the usual URL shapes:
 *   https://www.youtube.com/watch?v=ID
 *   https://youtu.be/ID
 *   https://www.youtube.com/embed/ID
 *   https://www.youtube.com/shorts/ID
 *   https://www.youtube.com/live/ID
 * Returns the 11-char ID, or '' when the input isn't a YouTube link.
 */
export function youtubeId(url) {
  if (!url) return ''
  const m = String(url).match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/,
  )
  return m ? m[1] : ''
}

export function youtubeEmbedUrl(url, params = 'rel=0') {
  const id = youtubeId(url)
  return id ? `https://www.youtube-nocookie.com/embed/${id}${params ? '?' + params : ''}` : ''
}

export function youtubeThumb(url) {
  const id = youtubeId(url)
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : ''
}
