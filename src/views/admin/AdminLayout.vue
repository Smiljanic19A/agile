<script setup>
import { useRouter } from 'vue-router'
import { logout, currentAdmin } from '@/lib/auth.js'

const router = useRouter()
const admin = currentAdmin()

const nav = [
  { to: '/admin',          label: 'Dashboard' },
  { to: '/admin/featured', label: 'Featured Banner' },
  { to: '/admin/articles', label: 'Articles' },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/imports',  label: 'Imports' },
]

async function doLogout() {
  await logout()
  router.replace('/admin/login')
}
</script>

<template>
  <div class="al">
    <aside class="al__sidebar">
      <div class="al__brand">
        <span class="al__brand-mark">AP</span>
        <span class="al__brand-label">Admin</span>
      </div>

      <nav class="al__nav">
        <router-link
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="al__link"
          exact-active-class="al__link--active"
        >{{ item.label }}</router-link>
      </nav>

      <div class="al__footer">
        <p class="al__email">{{ admin?.email }}</p>
        <button class="al__logout" @click="doLogout">Sign out</button>
      </div>
    </aside>

    <main class="al__main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.al { display: flex; min-height: 100svh; background: var(--paper); }

.al__sidebar {
  width: 220px; flex-shrink: 0; background: var(--ink); color: #f3f3f3;
  display: flex; flex-direction: column; padding: 28px 0;
  position: sticky; top: 0; height: 100svh;
}

.al__brand {
  display: flex; align-items: center; gap: 10px; padding: 0 24px 28px;
  border-bottom: 1px solid rgba(243,243,243,0.1);
}
.al__brand-mark {
  width: 32px; height: 32px; border-radius: 8px; background: var(--teal);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono); font-size: 11px; font-weight: 700; color: #f3f3f3;
  letter-spacing: 0.06em;
}
.al__brand-label { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(243,243,243,0.55); }

.al__nav { flex: 1; display: flex; flex-direction: column; gap: 2px; padding: 20px 12px; }
.al__link {
  display: block; padding: 9px 12px; border-radius: 8px;
  font-size: 14px; color: rgba(243,243,243,0.72);
  transition: background 120ms, color 120ms;
}
.al__link:hover,
.al__link--active { background: rgba(243,243,243,0.08); color: #f3f3f3; }

.al__footer { padding: 20px 24px; border-top: 1px solid rgba(243,243,243,0.1); display: flex; flex-direction: column; gap: 8px; }
.al__email { font-family: var(--font-mono); font-size: 10px; color: rgba(243,243,243,0.45); margin: 0; word-break: break-all; }
.al__logout {
  background: none; border: 1px solid rgba(243,243,243,0.18); border-radius: 6px;
  color: rgba(243,243,243,0.72); font-size: 12px; padding: 6px 10px; cursor: pointer;
  transition: border-color 120ms, color 120ms;
}
.al__logout:hover { border-color: rgba(243,243,243,0.4); color: #f3f3f3; }

.al__main { flex: 1; min-width: 0; }

@media (max-width: 768px) {
  .al { flex-direction: column; }
  .al__sidebar { width: 100%; height: auto; position: static; flex-direction: row; flex-wrap: wrap; padding: 16px; gap: 12px; }
  .al__brand { padding: 0; border: none; }
  .al__nav { flex-direction: row; flex-wrap: wrap; padding: 0; }
  .al__footer { border-top: none; padding: 0; flex-direction: row; align-items: center; gap: 12px; margin-left: auto; }
}
</style>
