<script setup>
import { useRouter } from 'vue-router'
import { logout, currentAdmin } from '@/lib/auth.js'

const router = useRouter()
const admin = currentAdmin()

const sections = [
  {
    label: 'Overview',
    items: [
      { to: '/admin', label: 'Dashboard', icon: 'grid' },
    ],
  },
  {
    label: 'Content',
    items: [
      { to: '/admin/featured', label: 'Featured Banner', icon: 'star' },
      { to: '/admin/articles', label: 'Articles', icon: 'doc' },
      { to: '/admin/products', label: 'Products', icon: 'box' },
      { to: '/admin/footer-links', label: 'Footer Links', icon: 'link' },
      { to: '/admin/bio', label: 'Contact Bio', icon: 'user' },
      { to: '/admin/media', label: 'Media', icon: 'image' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/admin/mail', label: 'Mail', icon: 'mail' },
      { to: '/admin/imports', label: 'Imports', icon: 'sync' },
      { to: '/admin/settings', label: 'API Keys', icon: 'key' },
    ],
  },
]

async function doLogout() {
  await logout()
  router.replace('/admin/login')
}
</script>

<template>
  <div class="ap-admin al">
    <aside class="al__sidebar">
      <div class="al__brand">
        <span class="al__brand-mark">
          <img src="/rabbit-mark.png" alt="" />
        </span>
        <span class="al__brand-text">
          <strong>Agile Periodization</strong>
          <span>Control room</span>
        </span>
      </div>

      <nav class="al__nav">
        <div v-for="sec in sections" :key="sec.label" class="al__group">
          <p class="al__group-label">{{ sec.label }}</p>
          <router-link
            v-for="item in sec.items"
            :key="item.to"
            :to="item.to"
            class="al__link"
            exact-active-class="al__link--active"
          >
            <span class="al__icon" aria-hidden="true">
              <!-- grid -->
              <svg v-if="item.icon === 'grid'" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                <rect x="2" y="2" width="5.5" height="5.5" rx="1.5"/><rect x="10.5" y="2" width="5.5" height="5.5" rx="1.5"/>
                <rect x="2" y="10.5" width="5.5" height="5.5" rx="1.5"/><rect x="10.5" y="10.5" width="5.5" height="5.5" rx="1.5"/>
              </svg>
              <!-- star -->
              <svg v-else-if="item.icon === 'star'" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round">
                <path d="M9 2.2l2.1 4.3 4.7.7-3.4 3.3.8 4.7L9 13l-4.2 2.2.8-4.7L2.2 7.2l4.7-.7L9 2.2z"/>
              </svg>
              <!-- doc -->
              <svg v-else-if="item.icon === 'doc'" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                <path d="M4 2.5h7l3 3V15.5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-12a1 1 0 0 1 1-1z" stroke-linejoin="round"/>
                <path d="M6.5 9h5M6.5 12h5"/>
              </svg>
              <!-- box -->
              <svg v-else-if="item.icon === 'box'" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round">
                <path d="M2.5 5.7L9 2.3l6.5 3.4v6.6L9 15.7l-6.5-3.4V5.7z"/>
                <path d="M2.5 5.7L9 9m0 0l6.5-3.3M9 9v6.7"/>
              </svg>
              <!-- link -->
              <svg v-else-if="item.icon === 'link'" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                <path d="M7.5 10.5a3.4 3.4 0 0 0 4.8 0l2.7-2.7a3.4 3.4 0 1 0-4.8-4.8l-1 1"/>
                <path d="M10.5 7.5a3.4 3.4 0 0 0-4.8 0L3 10.2A3.4 3.4 0 1 0 7.8 15l1-1"/>
              </svg>
              <!-- sync -->
              <svg v-else-if="item.icon === 'sync'" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M15 3.5v4h-4"/><path d="M3 14.5v-4h4"/>
                <path d="M4.2 7A5.5 5.5 0 0 1 14 5.5l1 2M13.8 11A5.5 5.5 0 0 1 4 12.5l-1-2"/>
              </svg>
              <!-- key -->
              <svg v-else-if="item.icon === 'key'" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="6" cy="12" r="3.4"/>
                <path d="M8.5 9.5L15 3m-2.5 2.5l2 2M10.5 7.5l2 2"/>
              </svg>
              <!-- image -->
              <svg v-else-if="item.icon === 'image'" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="3" width="14" height="12" rx="1.5"/>
                <circle cx="6.2" cy="7.2" r="1.4"/>
                <path d="M2.5 13l3.8-3.8 2.7 2.7 3-3L16 12.5"/>
              </svg>
              <!-- user -->
              <svg v-else-if="item.icon === 'user'" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="9" cy="6.2" r="3.1"/>
                <path d="M3.5 15.5a5.5 5.5 0 0 1 11 0"/>
              </svg>
              <!-- mail -->
              <svg v-else-if="item.icon === 'mail'" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="3.8" width="14" height="10.4" rx="1.5"/>
                <path d="M2.6 5l6.4 5 6.4-5"/>
              </svg>
            </span>
            {{ item.label }}
          </router-link>
        </div>
      </nav>

      <div class="al__footer">
        <a class="al__site" href="/" target="_blank" rel="noopener">
          <svg viewBox="0 0 14 14" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
            <path d="M6 3H3.5A1.5 1.5 0 0 0 2 4.5v6A1.5 1.5 0 0 0 3.5 12h6A1.5 1.5 0 0 0 11 10.5V8"/>
            <path d="M8.5 2H12v3.5M12 2L6.5 7.5"/>
          </svg>
          View live site
        </a>
        <div class="al__user">
          <span class="al__avatar">{{ (admin?.email || 'A')[0].toUpperCase() }}</span>
          <span class="al__email">{{ admin?.email }}</span>
        </div>
        <button class="al__logout" @click="doLogout">Sign out</button>
      </div>
    </aside>

    <main class="al__main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.al { display: flex; min-height: 100svh; background: var(--adm-canvas); }

.al__sidebar {
  width: 248px; flex-shrink: 0;
  background:
    radial-gradient(120% 60% at 0% 0%, rgba(55, 136, 130, 0.22), transparent 55%),
    linear-gradient(175deg, var(--adm-sidebar-2) 0%, var(--adm-sidebar) 60%);
  color: #f3f3f3;
  display: flex; flex-direction: column;
  position: sticky; top: 0; height: 100svh;
  border-right: 1px solid rgba(243, 243, 243, 0.06);
}

.al__brand {
  display: flex; align-items: center; gap: 12px;
  padding: 22px 20px 20px;
  border-bottom: 1px solid rgba(243, 243, 243, 0.08);
}
.al__brand-mark {
  width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
  background: linear-gradient(160deg, var(--adm-teal) 0%, var(--adm-teal-deep) 120%);
  display: grid; place-items: center;
  box-shadow: 0 2px 10px rgba(55, 136, 130, 0.4), inset 0 1px 0 rgba(255,255,255,0.16);
}
.al__brand-mark img { width: 26px; height: 26px; object-fit: contain; }
.al__brand-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.al__brand-text strong {
  font-family: var(--font-display); font-size: 13.5px; font-weight: 600;
  letter-spacing: -0.01em; color: #f3f3f3; white-space: nowrap;
}
.al__brand-text span {
  font-family: var(--font-mono); font-size: 9.5px; letter-spacing: 0.16em;
  text-transform: uppercase; color: rgba(155, 208, 203, 0.75);
}

.al__nav { flex: 1; overflow-y: auto; padding: 18px 12px; display: flex; flex-direction: column; gap: 22px; }
.al__group { display: flex; flex-direction: column; gap: 2px; }
.al__group-label {
  font-family: var(--font-mono); font-size: 9.5px; font-weight: 500;
  letter-spacing: 0.18em; text-transform: uppercase;
  color: rgba(243, 243, 243, 0.38);
  margin: 0 0 8px; padding: 0 12px;
}
.al__link {
  display: flex; align-items: center; gap: 11px;
  padding: 9px 12px; border-radius: 10px;
  font-size: 13.5px; font-weight: 480; color: rgba(243, 243, 243, 0.66);
  text-decoration: none; position: relative;
  transition: background 160ms var(--adm-ease), color 160ms var(--adm-ease);
}
.al__icon { display: grid; place-items: center; width: 18px; height: 18px; opacity: 0.85; }
.al__icon svg { width: 17px; height: 17px; }
.al__link:hover { background: rgba(243, 243, 243, 0.06); color: #f3f3f3; }
.al__link--active {
  background: linear-gradient(120deg, rgba(55, 136, 130, 0.28), rgba(55, 136, 130, 0.14));
  color: #fff; font-weight: 550;
}
.al__link--active::before {
  content: ''; position: absolute; left: -12px; top: 8px; bottom: 8px; width: 3px;
  border-radius: 0 3px 3px 0; background: var(--adm-teal-soft);
}
.al__link--active .al__icon { color: var(--adm-teal-soft); opacity: 1; }

.al__footer {
  padding: 16px 20px 18px; border-top: 1px solid rgba(243, 243, 243, 0.08);
  display: flex; flex-direction: column; gap: 12px;
}
.al__site {
  display: inline-flex; align-items: center; gap: 8px;
  font-family: var(--font-mono); font-size: 10.5px; letter-spacing: 0.1em; text-transform: uppercase;
  color: rgba(155, 208, 203, 0.85); text-decoration: none;
  transition: color 160ms var(--adm-ease);
}
.al__site:hover { color: #9bd0cb; }
.al__user { display: flex; align-items: center; gap: 9px; min-width: 0; }
.al__avatar {
  width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0;
  background: rgba(243, 243, 243, 0.1); border: 1px solid rgba(243, 243, 243, 0.16);
  display: grid; place-items: center;
  font-family: var(--font-mono); font-size: 11px; color: rgba(243, 243, 243, 0.85);
}
.al__email {
  font-family: var(--font-mono); font-size: 10px; color: rgba(243, 243, 243, 0.45);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.al__logout {
  background: none; border: 1px solid rgba(243, 243, 243, 0.16); border-radius: 8px;
  color: rgba(243, 243, 243, 0.72); font-size: 12px; padding: 7px 10px; cursor: pointer;
  transition: border-color 160ms, color 160ms, background 160ms;
}
.al__logout:hover { border-color: rgba(243, 243, 243, 0.4); color: #f3f3f3; background: rgba(243,243,243,0.05); }

.al__main { flex: 1; min-width: 0; }

@media (max-width: 860px) {
  .al { flex-direction: column; }
  .al__sidebar {
    width: 100%; height: auto; position: static;
    flex-direction: column; padding-bottom: 4px;
  }
  .al__nav { flex-direction: row; flex-wrap: wrap; gap: 10px; padding: 12px 16px; overflow: visible; }
  .al__group { flex-direction: row; flex-wrap: wrap; gap: 4px; }
  .al__group-label { display: none; }
  .al__link { padding: 8px 11px; }
  .al__link--active::before { display: none; }
  .al__footer { flex-direction: row; align-items: center; padding: 10px 16px 14px; gap: 14px; }
  .al__user { margin-left: auto; }
}
</style>
