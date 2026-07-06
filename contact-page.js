/**
 * =====================================================
 * contact-page.js — Prayer request form handler
 * Requires: backend.js loaded before this file
 * (Contact form itself is still handled in script.js)
 * =====================================================
 */

"use strict";

const prayerForm      = document.getElementById("prayerForm");
const prayerSuccess   = document.getElementById("prayerSuccess");
const prayerSubmitBtn = document.getElementById("prayerSubmitBtn");

prayerForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  prayerSubmitBtn.disabled = true;
  prayerSubmitBtn.textContent = "Submitting…";

  const { error } = await savePrayerRequest({
    fullName:    document.getElementById("prayerFullName").value.trim(),
    email:       document.getElementById("prayerEmail").value.trim(),
    phone:       document.getElementById("prayerPhone").value.trim(),
    requestText: document.getElementById("prayerRequestText").value.trim(),
    isPrivate:   document.getElementById("prayerPrivate").checked,
  });

  prayerSubmitBtn.disabled = false;
  prayerSubmitBtn.textContent = "Submit Prayer Request";

  if (error) {
    alert("Something went wrong submitting your prayer request. Please try again or contact us directly.");
    return;
  }

  if (prayerSuccess) {
    prayerSuccess.style.display = "block";
    setTimeout(() => { prayerSuccess.style.display = "none"; }, 5000);
  }
  prayerForm.reset();
});

/* ──────────────────────────────────────────────────
   PRAYER WALL — render + "I'm Praying" button
   ────────────────────────────────────────────────── */
function escapeHtmlC(str) {
  if (str === null || str === undefined) return "";
  const div = document.createElement("div");
  div.textContent = String(str);
  return div.innerHTML;
}

async function renderPrayerWall() {
  const host = document.getElementById("prayerWallGrid");
  if (!host) return;

  const requests = await loadPrayerWall(9);

  if (!requests.length) {
    host.innerHTML = `<p class="prayer-wall-empty">No public prayer requests right now — be the first to share one above.</p>`;
    return;
  }

  host.innerHTML = requests.map(r => `
    <div class="prayer-wall-card ${r.status === "answered" ? "answered" : ""}">
      <p class="prayer-wall-text">"${escapeHtmlC(r.request_text)}"</p>
      <div class="prayer-wall-foot">
        <span class="prayer-wall-name">${r.status === "answered" ? "✦ Answered" : escapeHtmlC(r.full_name || "A church family member")}</span>
        <button class="pray-btn" data-id="${r.id}">
          <i class="fa-solid fa-hands-praying"></i> <span class="pray-count">${r.pray_count || 0}</span> Praying
        </button>
      </div>
    </div>
  `).join("");

  host.querySelectorAll(".pray-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      btn.disabled = true;
      const { error } = await prayForRequest(btn.dataset.id);
      if (!error) {
        const countEl = btn.querySelector(".pray-count");
        countEl.textContent = (parseInt(countEl.textContent, 10) || 0) + 1;
      }
      // Leave disabled so a visitor can't spam the same button repeatedly
      // in this session; refreshing the page resets it.
    });
  });
}

renderPrayerWall();
