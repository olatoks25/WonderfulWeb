/**
 * =====================================================
 * about-page.js — Dynamic testimonies for about.html
 * Requires: backend.js and script.js loaded before this file
 * =====================================================
 */

"use strict";

function escapeHtmlAb(str) {
  if (str === null || str === undefined) return "";
  const div = document.createElement("div");
  div.textContent = String(str);
  return div.innerHTML;
}

function renderStars(rating) {
  const n = Math.max(0, Math.min(5, Math.round(rating || 5)));
  return "★".repeat(n) + "☆".repeat(5 - n);
}

async function renderTestimonies() {
  const track = document.getElementById("testimoniesTrack");
  const dotsHost = document.getElementById("sliderDots");
  if (!track) return;

  const testimonies = await loadTestimonies();

  if (!testimonies.length) {
    track.innerHTML = `<p style="color:var(--text-muted);padding:1rem;">No testimonies to show yet.</p>`;
    return;
  }

  track.innerHTML = testimonies.map(t => {
    const initials = (t.full_name || "?").trim().charAt(0).toUpperCase();
    const avatar = t.photo_url
      ? `<img src="${escapeHtmlAb(t.photo_url)}" alt="${escapeHtmlAb(t.full_name)}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
         <div class="testimony-avatar-fallback" style="display:none;">${initials}</div>`
      : `<div class="testimony-avatar-fallback">${initials}</div>`;

    return `
      <div class="testimony-card">
        <div class="testimony-quote">"</div>
        <p class="testimony-text">${escapeHtmlAb(t.testimony_text)}</p>
        <div class="testimony-author">
          ${avatar}
          <div><strong>${escapeHtmlAb(t.full_name)}</strong><span>${escapeHtmlAb(t.role_label)}</span></div>
        </div>
        <div class="testimony-stars">${renderStars(t.star_rating)}</div>
      </div>
    `;
  }).join("");

  if (dotsHost) {
    dotsHost.innerHTML = testimonies.map((_, i) =>
      `<button class="dot ${i === 0 ? "active" : ""}" data-index="${i}"></button>`
    ).join("");
  }

  if (typeof initTestimonySlider === "function") {
    initTestimonySlider();
  }
}

renderTestimonies();

/* ──────────────────────────────────────────────────
   PUBLIC TESTIMONY SUBMISSION
   ────────────────────────────────────────────────── */
const testimonyPublicForm      = document.getElementById("testimonyPublicForm");
const testimonyPublicSuccess   = document.getElementById("testimonyPublicSuccess");
const testimonyPublicSubmitBtn = document.getElementById("testimonyPublicSubmitBtn");

testimonyPublicForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  testimonyPublicSubmitBtn.disabled = true;
  testimonyPublicSubmitBtn.textContent = "Submitting…";

  const { error } = await saveTestimony({
    fullName:      document.getElementById("tpName").value.trim(),
    roleLabel:     document.getElementById("tpRole").value.trim(),
    testimonyText: document.getElementById("tpText").value.trim(),
    starRating:    5,
  });

  testimonyPublicSubmitBtn.disabled = false;
  testimonyPublicSubmitBtn.textContent = "Submit Testimony";

  if (error) {
    alert("Something went wrong submitting your testimony. Please try again.");
    return;
  }

  if (testimonyPublicSuccess) {
    testimonyPublicSuccess.style.display = "block";
    setTimeout(() => { testimonyPublicSuccess.style.display = "none"; }, 6000);
  }
  testimonyPublicForm.reset();
});
