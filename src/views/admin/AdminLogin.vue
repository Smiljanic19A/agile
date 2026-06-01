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
  <div class="login">
    <a class="login__back" href="/">← Back to site</a>
    <form class="login__card" @submit.prevent="onSubmit" autocomplete="on">
      <p class="eyebrow">Agile Periodization · Admin</p>
      <h1>Sign in.</h1>
      <p class="login__sub">Manage the featured banner. Nothing else for now.</p>

      <label>
        <span>Email</span>
        <input v-model="email" type="email" required autocomplete="username"
               placeholder="admin@admin.com" />
      </label>
      <label>
        <span>Password</span>
        <input v-model="password" type="password" required autocomplete="current-password"
               placeholder="••••••••" />
      </label>

      <p v-if="error" class="login__error">{{ error }}</p>

      <button class="button button-primary login__submit" type="submit" :disabled="busy">
        {{ busy ? 'Signing in…' : 'Sign in' }}
        <span class="arrow" aria-hidden="true">→</span>
      </button>

      <p class="login__hint">
        Dev creds: <code>admin@admin.com</code> / <code>monkey123</code>
      </p>
    </form>
  </div>
</template>

<style scoped>
.login {
  min-height: 100svh;
  background:
    radial-gradient(circle at 12% 18%, rgba(111, 165, 160, 0.12), transparent 45%),
    radial-gradient(circle at 88% 78%, rgba(196, 106, 58, 0.08), transparent 40%),
    linear-gradient(150deg, var(--paper) 0%, var(--cream) 100%);
  display: grid; place-items: center;
  padding: 32px 20px;
  position: relative;
}
.login__back {
  position: absolute;
  top: 24px; left: 24px;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-quiet);
  transition: color var(--t-fast) var(--ease);
}
.login__back:hover { color: var(--ink); }

.login__card {
  width: 100%;
  max-width: 440px;
  padding: 36px 36px 32px;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  display: grid;
  gap: 16px;
}
.login__card h1 {
  font-size: clamp(2rem, 4vw, 2.6rem);
  margin: 4px 0 0;
}
.login__sub {
  color: var(--ink-quiet);
  margin: -4px 0 12px;
}

label {
  display: grid; gap: 8px;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-quiet);
}
input {
  padding: 13px 14px;
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-sm);
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-body);
  font-size: 0.98rem;
}
input:focus {
  outline: none;
  border-color: var(--teal);
  box-shadow: 0 0 0 3px rgba(69, 124, 119, 0.18);
}

.login__error {
  margin: 0;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  background: rgba(196, 106, 58, 0.1);
  border: 1px solid rgba(196, 106, 58, 0.3);
  color: var(--rust-deep);
  font-size: 0.92rem;
}
.login__submit { width: 100%; margin-top: 4px; }

.login__hint {
  margin: 8px 0 0;
  padding-top: 16px;
  border-top: 1px solid var(--line);
  font-size: 0.82rem;
  color: var(--ink-quiet);
  text-align: center;
}
.login__hint code {
  font-family: var(--font-mono);
  font-size: 0.78em;
  padding: 2px 6px;
  background: var(--cream);
  border: 1px solid var(--line);
  border-radius: 4px;
  margin: 0 2px;
}
</style>
