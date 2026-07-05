<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { login } from '@/lib/auth.js'

const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const error = ref('')
const busy = ref(false)

async function onSubmit() {
  error.value = ''
  busy.value = true
  const result = login(email.value, password.value)
  busy.value = false
  if (result.ok) {
    const redirect = route.query.redirect || '/admin'
    router.replace(typeof redirect === 'string' ? redirect : '/admin')
  } else {
    error.value = result.error || 'Sign-in failed.'
  }
}
</script>

<template>
  <div class="ap-admin login">
    <!-- Brand panel -->
    <div class="login__brand" aria-hidden="true">
      <div class="login__loop">
        <svg class="login__ring" viewBox="0 0 300 300">
          <circle cx="150" cy="150" r="120" fill="none" stroke="rgba(243,243,243,0.14)" stroke-width="1" stroke-dasharray="5 6" />
          <g class="login__ring-arcs">
            <circle cx="150" cy="150" r="120" fill="none" stroke="#5ba39d" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="118 636" />
            <circle cx="150" cy="150" r="120" fill="none" stroke="rgba(155,208,203,0.45)" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="60 694" stroke-dashoffset="-260" />
          </g>
        </svg>
        <img class="login__rabbit" src="/rabbit-mark.png" alt="" />
      </div>
      <p class="login__brand-word"><strong>Agile</strong> Periodization</p>
      <p class="login__brand-tag">Plan · Train · Monitor · Review · Adapt · Repeat</p>
    </div>

    <!-- Form panel -->
    <div class="login__panel">
      <a class="login__back" href="/">← Back to site</a>

      <form class="login__card" @submit.prevent="onSubmit" autocomplete="on">
        <p class="adm-eyebrow">Control room</p>
        <h1 class="login__title">Sign in.</h1>
        <p class="login__sub">Articles, products, banner, footer, imports, and keys — all in one place.</p>

        <div class="adm-field">
          <label class="adm-label" for="login-email">Email</label>
          <input id="login-email" v-model="email" type="email" required autocomplete="username"
                 class="adm-input" placeholder="you@agileperiodization.com" />
        </div>
        <div class="adm-field">
          <label class="adm-label" for="login-pass">Password</label>
          <input id="login-pass" v-model="password" type="password" required autocomplete="current-password"
                 class="adm-input" placeholder="••••••••••" />
        </div>

        <p v-if="error" class="adm-alert adm-alert--danger">{{ error }}</p>

        <button class="adm-btn adm-btn--primary login__submit" type="submit" :disabled="busy">
          {{ busy ? 'Signing in…' : 'Sign in' }}
          <span aria-hidden="true">→</span>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login {
  min-height: 100svh;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
  background: var(--adm-canvas);
}

/* ── Brand panel ─────────────────────────────── */
.login__brand {
  position: relative;
  background:
    radial-gradient(110% 80% at 20% 10%, rgba(55, 136, 130, 0.35), transparent 60%),
    linear-gradient(165deg, #12211f 0%, var(--adm-sidebar) 70%);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 26px; padding: 40px; overflow: hidden;
}

.login__loop { position: relative; width: min(300px, 60%); aspect-ratio: 1; }
.login__ring { position: absolute; inset: 0; width: 100%; height: 100%; }
.login__ring-arcs {
  transform-origin: 50% 50%;
  animation: loginSpin 14s linear infinite;
}
@keyframes loginSpin { to { transform: rotate(360deg); } }
.login__rabbit {
  position: absolute; inset: 22%; width: 56%; height: 56%;
  object-fit: contain;
  filter: drop-shadow(0 8px 30px rgba(0, 0, 0, 0.35));
  animation: loginBreath 5s ease-in-out infinite;
}
@keyframes loginBreath { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }

.login__brand-word {
  font-family: var(--font-display); font-size: 22px; color: #f3f3f3;
  font-weight: 400; letter-spacing: -0.01em; margin: 0;
}
.login__brand-word strong { font-weight: 700; }
.login__brand-tag {
  font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.22em;
  text-transform: uppercase; color: rgba(155, 208, 203, 0.7); margin: 0;
}

/* ── Form panel ──────────────────────────────── */
.login__panel {
  display: grid; place-items: center; position: relative; padding: 32px 24px;
}
.login__back {
  position: absolute; top: 24px; left: 28px;
  font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--adm-mute); text-decoration: none;
  transition: color 160ms var(--adm-ease);
}
.login__back:hover { color: var(--adm-ink); }

.login__card {
  width: 100%; max-width: 400px;
  background: var(--adm-surface);
  border: 1px solid var(--adm-line);
  border-radius: var(--adm-r-lg);
  box-shadow: var(--adm-shadow-md);
  padding: 36px 34px 32px;
  display: grid; gap: 18px;
  animation: admPageIn 420ms var(--adm-ease) both;
}
.login__title {
  font-family: var(--font-display); font-size: clamp(28px, 4vw, 36px);
  font-weight: 700; letter-spacing: -0.02em; margin: 0; color: var(--adm-ink);
}
.login__sub { color: var(--adm-mute); font-size: 14px; line-height: 1.6; margin: -6px 0 6px; }
.login__submit { width: 100%; padding: 13px 18px; font-size: 14px; margin-top: 4px; }

@media (max-width: 860px) {
  .login { grid-template-columns: 1fr; }
  .login__brand { display: none; }
}
</style>
