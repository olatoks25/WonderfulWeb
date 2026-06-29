/**
 * =====================================================
 * admin.js — Admin dashboard logic
 * Requires: supabase-config.js loaded before this file
 * =====================================================
 */

"use strict";

const loginWrap   = document.getElementById("loginWrap");
const adminApp     = document.getElementById("adminApp");
const loginForm    = document.getElementById("loginForm");
const loginBtn     = document.getElementById("loginBtn");
const loginError   = document.getElementById("loginError");
const logoutBtn    = document.getElementById("logoutBtn");

function escapeHtmlA(str) {
  if (str === null || str === undefined) return "";
  const div = document.createElement("div");
  div.textContent = String(str);
  return div.innerHTML;
}

function fmtDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

/* ──────────────────────────────────────────────────
   AUTH
   ────────────────────────────────────────────────── */
async function checkSession() {
  const { data } = await supabaseClient.auth.getSession();
  if (data.session) {
    showAdminApp();
  } else {
    showLogin();
  }
}

function showLogin() {
  loginWrap.style.display = "block";
  adminApp.style.display = "none";
}

function showAdminApp() {
  loginWrap.style.display = "none";
  adminApp.style.display = "block";
  loadAllPanels();
}

loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginBtn.disabled = true;
  loginBtn.textContent = "Logging in…";
  loginError.style.display = "none";

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

  loginBtn.disabled = false;
  loginBtn.textContent = "Log In";

  if (error) {
    loginError.textContent = error.message || "Invalid email or password.";
    loginError.style.display = "block";
    return;
  }
  showAdminApp();
});

logoutBtn?.addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  showLogin();
});

/* ──────────────────────────────────────────────────
   TAB SWITCHING
   ────────────────────────────────────────────────── */
document.querySelectorAll(".admin-tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".admin-tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".admin-panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.panel).classList.add("active");
  });
});

/* ──────────────────────────────────────────────────
   LOAD ALL PANELS
   ────────────────────────────────────────────────── */
function loadAllPanels() {
  refreshPanel("contact");
  refreshPanel("events");
  refreshPanel("registrations");
  refreshPanel("sermons");
  refreshPanel("prayer");
  refreshPanel("giving");
}

async function refreshPanel(name) {
  const fns = {
    contact: renderContactTable,
    events: renderEventsTable,
    registrations: renderRegistrationsTable,
    sermons: renderSermonsTable,
    prayer: renderPrayerTable,
    giving: renderGivingTable,
  };
  if (fns[name]) await fns[name]();
}

/* ──────────────────────────────────────────────────
   1. CONTACT SUBMISSIONS
   ────────────────────────────────────────────────── */
async function renderContactTable() {
  const host = document.getElementById("contactTableHost");
  const { data, error } = await supabaseClient
    .from("contact_submissions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) { host.innerHTML = `<p class="admin-empty">Error loading: ${escapeHtmlA(error.message)}</p>`; return; }
  if (!data.length) { host.innerHTML = `<p class="admin-empty">No messages yet.</p>`; return; }

  host.innerHTML = `
    <table class="admin-table">
      <thead><tr><th>Date</th><th>Name</th><th>Email</th><th>Phone</th><th>Subject</th><th>Message</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>
        ${data.map(row => `
          <tr>
            <td>${fmtDateTime(row.created_at)}</td>
            <td>${escapeHtmlA(row.first_name)} ${escapeHtmlA(row.last_name)}</td>
            <td>${escapeHtmlA(row.email)}</td>
            <td>${escapeHtmlA(row.phone)}</td>
            <td class="wrap">${escapeHtmlA(row.subject)}</td>
            <td class="wrap">${escapeHtmlA(row.message)}</td>
            <td><span class="admin-pill pill-${row.status}">${escapeHtmlA(row.status)}</span></td>
            <td>
              ${row.status === "new" ? `<button class="admin-btn-sm" onclick="markContactRead('${row.id}')">Mark Read</button>` : ""}
              <button class="admin-btn-sm danger" onclick="deleteRow('contact_submissions','${row.id}','contact')">Delete</button>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

async function markContactRead(id) {
  await supabaseClient.from("contact_submissions").update({ status: "read" }).eq("id", id);
  renderContactTable();
}

/* ──────────────────────────────────────────────────
   2. EVENTS
   ────────────────────────────────────────────────── */
document.getElementById("eventForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const { error } = await supabaseClient.from("events").insert([{
    title: document.getElementById("evTitle").value.trim(),
    description: document.getElementById("evDesc").value.trim(),
    tag: document.getElementById("evTag").value.trim(),
    event_date: document.getElementById("evDate").value,
    start_time: document.getElementById("evStart").value.trim(),
    end_time: document.getElementById("evEnd").value.trim(),
    location: document.getElementById("evLocation").value.trim(),
    cta_label: document.getElementById("evCta").value,
    image_url: document.getElementById("evImage").value.trim() || null,
  }]);
  if (error) { alert("Error adding event: " + error.message); return; }
  e.target.reset();
  renderEventsTable();
});

async function renderEventsTable() {
  const host = document.getElementById("eventsTableHost");
  const { data, error } = await supabaseClient
    .from("events")
    .select("*")
    .order("event_date", { ascending: true });

  if (error) { host.innerHTML = `<p class="admin-empty">Error loading: ${escapeHtmlA(error.message)}</p>`; return; }
  if (!data.length) { host.innerHTML = `<p class="admin-empty">No events yet.</p>`; return; }

  host.innerHTML = `
    <table class="admin-table">
      <thead><tr><th>Date</th><th>Title</th><th>Tag</th><th>Time</th><th>Location</th><th>Published</th><th>Actions</th></tr></thead>
      <tbody>
        ${data.map(row => `
          <tr>
            <td>${escapeHtmlA(row.event_date)}</td>
            <td class="wrap">${escapeHtmlA(row.title)}</td>
            <td>${escapeHtmlA(row.tag)}</td>
            <td>${escapeHtmlA(row.start_time)} – ${escapeHtmlA(row.end_time)}</td>
            <td class="wrap">${escapeHtmlA(row.location)}</td>
            <td>${row.published ? "✅" : "🚫"}</td>
            <td>
              <button class="admin-btn-sm" onclick="toggleEventPublished('${row.id}', ${row.published})">${row.published ? "Unpublish" : "Publish"}</button>
              <button class="admin-btn-sm danger" onclick="deleteRow('events','${row.id}','events')">Delete</button>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

async function toggleEventPublished(id, current) {
  await supabaseClient.from("events").update({ published: !current }).eq("id", id);
  renderEventsTable();
}

/* ──────────────────────────────────────────────────
   3. EVENT REGISTRATIONS
   ────────────────────────────────────────────────── */
async function renderRegistrationsTable() {
  const host = document.getElementById("registrationsTableHost");
  const { data, error } = await supabaseClient
    .from("event_registrations")
    .select("*, events(title)")
    .order("created_at", { ascending: false });

  if (error) { host.innerHTML = `<p class="admin-empty">Error loading: ${escapeHtmlA(error.message)}</p>`; return; }
  if (!data.length) { host.innerHTML = `<p class="admin-empty">No registrations yet.</p>`; return; }

  host.innerHTML = `
    <table class="admin-table">
      <thead><tr><th>Date</th><th>Event</th><th>Name</th><th>Phone</th><th>Email</th><th>Notes</th><th>Actions</th></tr></thead>
      <tbody>
        ${data.map(row => `
          <tr>
            <td>${fmtDateTime(row.created_at)}</td>
            <td class="wrap">${escapeHtmlA(row.events?.title || "(deleted event)")}</td>
            <td>${escapeHtmlA(row.full_name)}</td>
            <td>${escapeHtmlA(row.phone)}</td>
            <td>${escapeHtmlA(row.email)}</td>
            <td class="wrap">${escapeHtmlA(row.notes)}</td>
            <td><button class="admin-btn-sm danger" onclick="deleteRow('event_registrations','${row.id}','registrations')">Delete</button></td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

/* ──────────────────────────────────────────────────
   4. SERMONS
   ────────────────────────────────────────────────── */
document.getElementById("sermonForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const { error } = await supabaseClient.from("sermons").insert([{
    title: document.getElementById("smTitle").value.trim(),
    preacher: document.getElementById("smPreacher").value.trim(),
    sermon_date: document.getElementById("smDate").value,
    category: document.getElementById("smCategory").value,
    image_url: document.getElementById("smImage").value.trim() || null,
    watch_url: document.getElementById("smWatch").value.trim() || null,
    listen_url: document.getElementById("smListen").value.trim() || null,
    is_new: document.getElementById("smIsNew").checked,
  }]);
  if (error) { alert("Error adding sermon: " + error.message); return; }
  e.target.reset();
  renderSermonsTable();
});

async function renderSermonsTable() {
  const host = document.getElementById("sermonsTableHost");
  const { data, error } = await supabaseClient
    .from("sermons")
    .select("*")
    .order("sermon_date", { ascending: false });

  if (error) { host.innerHTML = `<p class="admin-empty">Error loading: ${escapeHtmlA(error.message)}</p>`; return; }
  if (!data.length) { host.innerHTML = `<p class="admin-empty">No sermons yet.</p>`; return; }

  host.innerHTML = `
    <table class="admin-table">
      <thead><tr><th>Date</th><th>Title</th><th>Preacher</th><th>Category</th><th>New?</th><th>Published</th><th>Actions</th></tr></thead>
      <tbody>
        ${data.map(row => `
          <tr>
            <td>${escapeHtmlA(row.sermon_date)}</td>
            <td class="wrap">${escapeHtmlA(row.title)}</td>
            <td>${escapeHtmlA(row.preacher)}</td>
            <td>${escapeHtmlA(row.category)}</td>
            <td>${row.is_new ? "✅" : "—"}</td>
            <td>${row.published ? "✅" : "🚫"}</td>
            <td>
              <button class="admin-btn-sm" onclick="toggleSermonPublished('${row.id}', ${row.published})">${row.published ? "Unpublish" : "Publish"}</button>
              <button class="admin-btn-sm danger" onclick="deleteRow('sermons','${row.id}','sermons')">Delete</button>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

async function toggleSermonPublished(id, current) {
  await supabaseClient.from("sermons").update({ published: !current }).eq("id", id);
  renderSermonsTable();
}

/* ──────────────────────────────────────────────────
   5. PRAYER REQUESTS
   ────────────────────────────────────────────────── */
async function renderPrayerTable() {
  const host = document.getElementById("prayerTableHost");
  const { data, error } = await supabaseClient
    .from("prayer_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) { host.innerHTML = `<p class="admin-empty">Error loading: ${escapeHtmlA(error.message)}</p>`; return; }
  if (!data.length) { host.innerHTML = `<p class="admin-empty">No prayer requests yet.</p>`; return; }

  host.innerHTML = `
    <table class="admin-table">
      <thead><tr><th>Date</th><th>Name</th><th>Contact</th><th>Request</th><th>Private?</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>
        ${data.map(row => `
          <tr>
            <td>${fmtDateTime(row.created_at)}</td>
            <td>${escapeHtmlA(row.full_name)}</td>
            <td>${escapeHtmlA(row.email)}<br/>${escapeHtmlA(row.phone)}</td>
            <td class="wrap">${escapeHtmlA(row.request_text)}</td>
            <td>${row.is_private ? "🔒" : "—"}</td>
            <td><span class="admin-pill pill-${row.status}">${escapeHtmlA(row.status)}</span></td>
            <td>
              <select class="admin-btn-sm" onchange="updatePrayerStatus('${row.id}', this.value)" style="background:#222;color:#fff;">
                <option value="new" ${row.status === "new" ? "selected" : ""}>New</option>
                <option value="praying" ${row.status === "praying" ? "selected" : ""}>Praying</option>
                <option value="answered" ${row.status === "answered" ? "selected" : ""}>Answered</option>
              </select>
              <button class="admin-btn-sm danger" onclick="deleteRow('prayer_requests','${row.id}','prayer')">Delete</button>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

async function updatePrayerStatus(id, status) {
  await supabaseClient.from("prayer_requests").update({ status }).eq("id", id);
  renderPrayerTable();
}

/* ──────────────────────────────────────────────────
   6. GIVING RECORDS
   ────────────────────────────────────────────────── */
async function renderGivingTable() {
  const host = document.getElementById("givingTableHost");
  const { data, error } = await supabaseClient
    .from("giving_records")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) { host.innerHTML = `<p class="admin-empty">Error loading: ${escapeHtmlA(error.message)}</p>`; return; }
  if (!data.length) { host.innerHTML = `<p class="admin-empty">No giving records yet.</p>`; return; }

  host.innerHTML = `
    <table class="admin-table">
      <thead><tr><th>Date</th><th>Name</th><th>Contact</th><th>Type</th><th>Amount</th><th>Note</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>
        ${data.map(row => `
          <tr>
            <td>${fmtDateTime(row.created_at)}</td>
            <td>${escapeHtmlA(row.full_name)}</td>
            <td>${escapeHtmlA(row.email)}<br/>${escapeHtmlA(row.phone)}</td>
            <td>${escapeHtmlA(row.giving_type)}</td>
            <td>${row.amount ? "₦" + Number(row.amount).toLocaleString() : "—"}</td>
            <td class="wrap">${escapeHtmlA(row.reference_note)}</td>
            <td><span class="admin-pill pill-${row.status}">${escapeHtmlA(row.status)}</span></td>
            <td>
              ${row.status === "pending" ? `<button class="admin-btn-sm" onclick="confirmGiving('${row.id}')">Confirm</button>` : ""}
              <button class="admin-btn-sm danger" onclick="deleteRow('giving_records','${row.id}','giving')">Delete</button>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

async function confirmGiving(id) {
  await supabaseClient.from("giving_records").update({ status: "confirmed" }).eq("id", id);
  renderGivingTable();
}

/* ──────────────────────────────────────────────────
   SHARED DELETE
   ────────────────────────────────────────────────── */
async function deleteRow(table, id, panelName) {
  if (!confirm("Are you sure you want to delete this record? This cannot be undone.")) return;
  const { error } = await supabaseClient.from(table).delete().eq("id", id);
  if (error) { alert("Error deleting: " + error.message); return; }
  refreshPanel(panelName);
}

/* ──────────────────────────────────────────────────
   INIT
   ────────────────────────────────────────────────── */
checkSession();
