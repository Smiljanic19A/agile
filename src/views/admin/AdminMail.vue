<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminLayout from './AdminLayout.vue'
import { api } from '@/lib/api.js'

const loading = ref(true)
const error = ref('')

// ── Recipient ────────────────────────────────────────────────────
const recipient = ref('')
const recipientDefault = ref('')
const savingRecipient = ref(false)
const recipientFlash = ref(false)

// ── SMTP ─────────────────────────────────────────────────────────
// Credentials live in the settings table, not env, so they can be changed
// without a redeploy. Until a host is set here (or in the server env), Laravel
// falls back to the `log` driver and nothing is actually delivered.
const smtp = ref({
  mail_host: '', mail_port: '', mail_username: '', mail_password: '',
  mail_encryption: 'tls', mail_from_address: '', mail_from_name: '',
})
const mailStatus = ref(null)
const smtpOpen = ref(false)
const savingSmtp = ref(false)
const smtpFlash = ref(false)
const testing = ref(false)
const testResult = ref(null)

// ── Inbox ────────────────────────────────────────────────────────
const messages = ref([])
const openId = ref(null)
const filter = ref('all') // all | unread
const search = ref('')
const deleteConfirm = ref(null)

onMounted(async () => {
  try {
    const [rec, msgs, mail] = await Promise.all([
      api.admin.contactEmail(),
      api.admin.messages(),
      api.admin.mailSettings(),
    ])
    recipient.value = rec.email || ''
    recipientDefault.value = rec.default || ''
    messages.value = msgs
    applyMailSettings(mail)
    // Nothing configured yet is exactly when the admin needs the form open.
    smtpOpen.value = !mailStatus.value?.configured
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

function applyMailSettings(payload) {
  smtp.value = { ...smtp.value, ...(payload.settings || {}) }
  if (!smtp.value.mail_encryption) smtp.value.mail_encryption = 'tls'
  mailStatus.value = payload.status || null
}

async function saveSmtp() {
  savingSmtp.value = true
  error.value = ''
  testResult.value = null
  try {
    const payload = { ...smtp.value }
    if (payload.mail_port === '') payload.mail_port = null
    applyMailSettings(await api.admin.updateMailSettings(payload))
    smtpFlash.value = true
    setTimeout(() => (smtpFlash.value = false), 1800)
  } catch (e) {
    error.value = e.message
  } finally {
    savingSmtp.value = false
  }
}

async function sendTest() {
  testing.value = true
  testResult.value = null
  try {
    const res = await api.admin.sendTestMail(recipient.value.trim() || undefined)
    testResult.value = { ok: true, message: res.message }
  } catch (e) {
    testResult.value = { ok: false, message: e.message }
  } finally {
    testing.value = false
  }
}

async function saveRecipient() {
  const email = recipient.value.trim()
  if (!email) return
  savingRecipient.value = true
  error.value = ''
  try {
    const rec = await api.admin.updateContactEmail(email)
    recipient.value = rec.email
    recipientFlash.value = true
    setTimeout(() => (recipientFlash.value = false), 1800)
  } catch (e) {
    error.value = e.message
  } finally {
    savingRecipient.value = false
  }
}

const unreadCount = computed(() => messages.value.filter((m) => !m.read_at).length)

const filtered = computed(() => {
  let list = filter.value === 'unread' ? messages.value.filter((m) => !m.read_at) : messages.value
  const q = search.value.trim().toLowerCase()
  if (q) {
    list = list.filter((m) =>
      [m.name, m.email, m.role, m.interest, m.message].some((f) => (f || '').toLowerCase().includes(q)),
    )
  }
  return list
})

async function toggleOpen(m) {
  openId.value = openId.value === m.id ? null : m.id
  if (openId.value === m.id && !m.read_at) {
    try {
      const fresh = await api.admin.updateMessage(m.id, { read: true })
      Object.assign(m, fresh)
    } catch { /* stays unread — non-fatal */ }
  }
}

async function markUnread(m) {
  try {
    const fresh = await api.admin.updateMessage(m.id, { read: false })
    Object.assign(m, fresh)
    openId.value = null
  } catch (e) {
    error.value = e.message
  }
}

async function confirmDelete() {
  if (!deleteConfirm.value) return
  try {
    await api.admin.deleteMessage(deleteConfirm.value.id)
    messages.value = messages.value.filter((m) => m.id !== deleteConfirm.value.id)
    deleteConfirm.value = null
  } catch (e) {
    error.value = e.message
  }
}

function replyHref(m) {
  const sub = encodeURIComponent('Re: ' + (m.interest || 'your inquiry') + ' — agileperiodization.com')
  return `mailto:${m.email}?subject=${sub}`
}

function fmtDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}
</script>

<template>
  <AdminLayout>
    <div class="adm-page ml">
      <header class="adm-head">
        <div>
          <p class="adm-eyebrow">Operations</p>
          <h1 class="adm-title">
            Mail
            <span v-if="unreadCount" class="ml__badge">{{ unreadCount }} new</span>
          </h1>
          <p class="adm-sub">
            Inquiries from the contact form. Each one is stored here and forwarded to the address below.
          </p>
        </div>
      </header>

      <p v-if="error" class="adm-alert adm-alert--danger">{{ error }}</p>

      <div v-if="loading" class="adm-loading">
        <span class="adm-loop"><svg viewBox="0 0 34 34"><circle cx="17" cy="17" r="14" /></svg></span>
        Loading mail…
      </div>

      <template v-else>
        <!-- Delivery -->
        <div class="adm-card ml__card">
          <p class="ml__legend">Delivery</p>
          <div class="ml__recipient">
            <input
              v-model="recipient"
              type="email"
              class="adm-input adm-input--mono ml__recipient-input"
              placeholder="who@example.com"
              @keydown.enter="saveRecipient"
            />
            <button class="adm-btn adm-btn--primary" :disabled="savingRecipient || !recipient.trim()" @click="saveRecipient">
              {{ savingRecipient ? 'Saving…' : recipientFlash ? 'Saved ✓' : 'Save' }}
            </button>
          </div>
          <p class="adm-hint">
            Every submission is emailed to this address. Messages are always stored in the inbox below,
            even if email delivery fails — nothing gets lost.
            <template v-if="recipientDefault"> Default: <code>{{ recipientDefault }}</code>.</template>
          </p>

          <!-- Sending server -->
          <div v-if="mailStatus" class="ml__status" :class="mailStatus.configured ? 'is-ok' : 'is-bad'">
            <span class="ml__status-dot" aria-hidden="true"></span>
            <span class="ml__status-text">
              <strong>{{ mailStatus.configured ? 'Sending is active' : 'Sending is OFF' }}</strong>
              — {{ mailStatus.detail }}
            </span>
            <button class="adm-btn adm-btn--sm" @click="smtpOpen = !smtpOpen">
              {{ smtpOpen ? 'Hide' : 'Configure' }}
            </button>
            <button class="adm-btn adm-btn--sm adm-btn--primary" :disabled="testing" @click="sendTest">
              {{ testing ? 'Sending…' : 'Send test' }}
            </button>
          </div>

          <p v-if="testResult" class="adm-alert" :class="testResult.ok ? 'adm-alert--ok' : 'adm-alert--danger'">
            {{ testResult.message }}
          </p>

          <div v-if="smtpOpen" class="ml__smtp">
            <p class="ml__legend">Outgoing mail server (SMTP)</p>
            <div class="ml__grid">
              <label class="ml__f ml__f--wide">
                <span>Host</span>
                <input v-model="smtp.mail_host" class="adm-input adm-input--mono" placeholder="smtp.postmarkapp.com" />
              </label>
              <label class="ml__f">
                <span>Port</span>
                <input v-model="smtp.mail_port" type="number" class="adm-input adm-input--mono" placeholder="587" />
              </label>
              <label class="ml__f">
                <span>Encryption</span>
                <select v-model="smtp.mail_encryption" class="adm-input">
                  <option value="tls">TLS (587)</option>
                  <option value="ssl">SSL (465)</option>
                  <option value="none">None</option>
                </select>
              </label>
              <label class="ml__f ml__f--wide">
                <span>Username</span>
                <input v-model="smtp.mail_username" class="adm-input adm-input--mono" autocomplete="off" />
              </label>
              <label class="ml__f ml__f--wide">
                <span>Password / API token</span>
                <input v-model="smtp.mail_password" type="password" class="adm-input adm-input--mono" autocomplete="new-password" />
              </label>
              <label class="ml__f ml__f--wide">
                <span>From address</span>
                <input v-model="smtp.mail_from_address" type="email" class="adm-input adm-input--mono" placeholder="noreply@agileperiodization.com" />
              </label>
              <label class="ml__f ml__f--wide">
                <span>From name</span>
                <input v-model="smtp.mail_from_name" class="adm-input" placeholder="Agile Periodization" />
              </label>
            </div>
            <div class="ml__smtp-actions">
              <button class="adm-btn adm-btn--primary" :disabled="savingSmtp" @click="saveSmtp">
                {{ savingSmtp ? 'Saving…' : smtpFlash ? 'Saved ✓' : 'Save mail settings' }}
              </button>
            </div>
            <p class="adm-hint">
              The <em>From address</em> must be on a domain the provider has verified, otherwise mail is
              rejected or lands in spam. Leaving the host blank falls back to the server's own configuration.
            </p>
          </div>
        </div>

        <!-- Inbox -->
        <div class="ml__toolbar">
          <div class="adm-seg">
            <button type="button" :class="{ 'is-on': filter === 'all' }" @click="filter = 'all'">
              All ({{ messages.length }})
            </button>
            <button type="button" :class="{ 'is-on': filter === 'unread' }" @click="filter = 'unread'">
              Unread ({{ unreadCount }})
            </button>
          </div>
          <input v-model="search" class="adm-input ml__search" placeholder="Search name, email, message…" />
        </div>

        <div v-if="filtered.length" class="ml__list">
          <div
            v-for="m in filtered"
            :key="m.id"
            class="adm-card ml__msg"
            :class="{ 'is-unread': !m.read_at, 'is-open': openId === m.id }"
          >
            <button type="button" class="ml__row" @click="toggleOpen(m)">
              <span class="ml__dot" :class="{ 'is-on': !m.read_at }" aria-hidden="true"></span>
              <span class="ml__who">
                <strong>{{ m.name || m.email }}</strong>
                <span v-if="m.name" class="ml__email">{{ m.email }}</span>
              </span>
              <span v-if="m.interest" class="ml__chip">{{ m.interest }}</span>
              <span class="ml__date">{{ fmtDate(m.created_at) }}</span>
              <span class="ml__caret" aria-hidden="true">{{ openId === m.id ? '▴' : '▾' }}</span>
            </button>

            <div v-if="openId === m.id" class="ml__detail">
              <dl class="ml__facts">
                <div><dt>Email</dt><dd><a :href="'mailto:' + m.email">{{ m.email }}</a></dd></div>
                <div v-if="m.role"><dt>Role / org</dt><dd>{{ m.role }}</dd></div>
                <div v-if="m.interest"><dt>Interest</dt><dd>{{ m.interest }}</dd></div>
                <div><dt>Received</dt><dd>{{ fmtDate(m.created_at) }}</dd></div>
                <div>
                  <dt>Forwarded</dt>
                  <dd>
                    <span v-if="m.delivered_at" class="ml__ok">Delivered {{ fmtDate(m.delivered_at) }}</span>
                    <span v-else-if="m.delivery_error" class="ml__fail">Not sent — {{ m.delivery_error }}</span>
                    <span v-else class="ml__mute">Not recorded</span>
                  </dd>
                </div>
              </dl>
              <p class="ml__body">{{ m.message || '— no message —' }}</p>
              <div class="ml__actions">
                <a class="adm-btn adm-btn--sm adm-btn--primary" :href="replyHref(m)">Reply</a>
                <button class="adm-btn adm-btn--sm" @click="markUnread(m)">Mark unread</button>
                <button class="adm-btn adm-btn--sm adm-btn--danger" @click="deleteConfirm = m">Delete</button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="ml__empty adm-card">
          <p><strong>{{ messages.length ? 'Nothing matches.' : 'No messages yet.' }}</strong></p>
          <p>{{ messages.length ? 'Try a different filter or search.' : 'Submissions from the contact form will show up here.' }}</p>
        </div>
      </template>
    </div>

    <!-- Delete confirm -->
    <div v-if="deleteConfirm" class="ap-admin">
      <div class="adm-modal-bg" @click.self="deleteConfirm = null">
        <div class="adm-modal">
          <h3>Delete this message?</h3>
          <p>
            The inquiry from <strong>{{ deleteConfirm.name || deleteConfirm.email }}</strong> will be
            removed permanently. This cannot be undone.
          </p>
          <div class="adm-modal-actions">
            <button class="adm-btn" @click="deleteConfirm = null">Keep it</button>
            <button class="adm-btn adm-btn--danger" @click="confirmDelete()">Delete message</button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<style scoped>
.ml__badge {
  display: inline-block; vertical-align: middle; margin-left: 10px;
  font-family: var(--font-mono); font-size: 10.5px; letter-spacing: 0.08em;
  color: #fff; background: var(--adm-teal);
  border-radius: 20px; padding: 3px 9px;
}

.ml__card { padding: 20px 22px; margin-bottom: 18px; display: block; }
.ml__legend {
  font-family: var(--font-mono); font-size: 10.5px; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--adm-mute);
  margin: 0 0 10px;
}
.ml__recipient { display: flex; gap: 10px; margin-bottom: 8px; }
.ml__recipient-input { max-width: 340px; }
.ml__card code {
  font-family: var(--font-mono); font-size: 11px;
  background: var(--adm-surface); border: 1px solid var(--adm-line);
  border-radius: 5px; padding: 1px 5px;
}

/* ── Sending status + SMTP form ─────────────────────────────── */
.ml__status {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  margin-top: 14px; padding: 10px 12px;
  border: 1px solid var(--adm-line); border-radius: 8px;
  background: var(--adm-surface); font-size: 13px;
}
.ml__status-text { flex: 1; min-width: 220px; }
.ml__status-dot { width: 8px; height: 8px; border-radius: 50%; flex: none; }
.ml__status.is-ok .ml__status-dot { background: #2f9e6f; }
.ml__status.is-bad .ml__status-dot { background: #c9503c; }
.ml__status.is-bad { border-color: rgba(201, 80, 60, 0.4); }

.ml__smtp { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--adm-line); }
.ml__grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.ml__f { display: flex; flex-direction: column; gap: 5px; grid-column: span 1; }
.ml__f--wide { grid-column: span 2; }
.ml__f > span {
  font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--adm-mute);
}
.ml__smtp-actions { display: flex; gap: 10px; margin: 14px 0 8px; }
@media (max-width: 780px) {
  .ml__grid { grid-template-columns: 1fr 1fr; }
  .ml__f--wide { grid-column: span 2; }
}

.ml__ok { color: #2f9e6f; }
.ml__fail { color: #c9503c; }
.ml__mute { color: var(--adm-mute); }

.ml__toolbar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 14px; }
.ml__search { width: 260px; }

.ml__list { display: flex; flex-direction: column; gap: 10px; }

.ml__msg { padding: 0; overflow: hidden; display: block; }
.ml__msg.is-unread { border-color: rgba(55, 136, 130, 0.45); }
.ml__msg.is-open { box-shadow: 0 0 0 2px var(--adm-teal-mist); }

.ml__row {
  display: flex; align-items: center; gap: 12px;
  width: 100%; text-align: left;
  background: none; border: none; cursor: pointer;
  padding: 13px 16px;
  font-family: inherit; color: var(--adm-ink);
}
.ml__dot {
  flex-shrink: 0; width: 8px; height: 8px; border-radius: 50%;
  background: var(--adm-line);
}
.ml__dot.is-on { background: var(--adm-teal); box-shadow: 0 0 0 3px var(--adm-teal-mist); }

.ml__who { display: flex; align-items: baseline; gap: 8px; min-width: 0; flex: 1; }
.ml__who strong { font-size: 13.5px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ml__msg.is-unread .ml__who strong { color: var(--adm-teal-deep); }
.ml__email {
  font-family: var(--font-mono); font-size: 10.5px; color: var(--adm-mute);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.ml__chip {
  flex-shrink: 0;
  font-size: 11px; color: var(--adm-teal-deep);
  background: var(--adm-teal-mist); border: 1px solid rgba(55, 136, 130, 0.25);
  border-radius: 20px; padding: 3px 10px;
  white-space: nowrap; max-width: 200px; overflow: hidden; text-overflow: ellipsis;
}
.ml__date {
  flex-shrink: 0;
  font-family: var(--font-mono); font-size: 10.5px; color: var(--adm-mute);
}
.ml__caret { flex-shrink: 0; font-size: 10px; color: var(--adm-mute); }

.ml__detail { border-top: 1px solid var(--adm-line); padding: 16px; }
.ml__facts {
  display: flex; flex-wrap: wrap; gap: 8px 28px;
  margin: 0 0 14px;
}
.ml__facts div { display: flex; align-items: baseline; gap: 8px; }
.ml__facts dt {
  font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--adm-mute);
}
.ml__facts dd { margin: 0; font-size: 13px; color: var(--adm-ink); }
.ml__facts a { color: var(--adm-teal-deep); }

.ml__body {
  font-size: 14px; line-height: 1.65; color: var(--adm-ink-soft);
  white-space: pre-wrap; margin: 0 0 16px;
  background: var(--adm-surface); border: 1px solid var(--adm-line);
  border-radius: 10px; padding: 14px 16px;
}
.ml__actions { display: flex; gap: 8px; flex-wrap: wrap; }
.ml__actions a { text-decoration: none; }

.ml__empty {
  padding: 44px 24px; text-align: center;
  display: grid; gap: 8px; justify-items: center;
  color: var(--adm-mute);
}
.ml__empty strong { color: var(--adm-ink); }

@media (max-width: 700px) {
  .ml__chip { display: none; }
  .ml__recipient { flex-wrap: wrap; }
}
</style>
