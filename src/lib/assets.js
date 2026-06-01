// Manifest of images committed to /public/assets/images/.
// Until a backend exists, this is the source of truth for the asset gallery.
// When a backend lands, swap to a GET /api/assets endpoint that returns this shape.

export const ASSET_IMAGES = [
  { path: '/assets/images/philosophical-foundations.png', name: 'Philosophical Foundations', tag: 'Course cover' },
  { path: '/assets/images/strength-training-manual.png',  name: 'Strength Training Manual',  tag: 'Book cover'   },
  { path: '/assets/images/endurance-map-builder.png',     name: 'Endurance Map Builder',     tag: 'Tool cover'   },
  { path: '/assets/images/badger-protocol.png',           name: 'Badger Protocol',           tag: 'PDF cover'    },
  { path: '/assets/images/conditioning-mma.png',          name: 'Conditioning for MMA',      tag: 'Course cover' },
  { path: '/assets/images/decoding-fatigue.png',          name: 'Decoding Fatigue',          tag: 'Course cover' },
  { path: '/assets/images/hiit-manual.jpg',               name: 'HIIT Manual',               tag: 'Book cover'   },
  { path: '/assets/images/mladen-profile.jpg',            name: 'Mladen — profile',          tag: 'Portrait'     },
  { path: '/assets/images/mladen-secondary.jpg',          name: 'Mladen — secondary',        tag: 'Portrait'     },
  { path: '/assets/images/ap-logo.svg',                   name: 'AP Logo',                   tag: 'Brand mark'   },
]

export function isDataUrl(s) {
  return typeof s === 'string' && s.startsWith('data:')
}

export function looksLikeAsset(s) {
  return typeof s === 'string' && s.startsWith('/assets/')
}
