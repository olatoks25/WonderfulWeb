/**
 * =====================================================
 * events-page.js — Dynamic events rendering + registration
 * Requires: backend.js loaded before this file
 * =====================================================
 */

"use strict";

const eventsGrid    = document.getElementById("eventsGrid");
const eventsLoading  = document.getElementById("eventsLoading");
const regModalOverlay = document.getElementById("regModalOverlay");
const regModalClose   = document.getElementById("regModalClose");
const regForm         = document.getElementById("regForm");
const regEventTitle   = document.getElementById("regEventTitle");
const regEventId      = document.getElementById("regEventId");
const regSuccess      = document.getElementById("regSuccess");
const regSubmitBtn    = document.getElementById("regSubmitBtn");

function renderEventCard(ev, delayClass) {
  const { month, day } = formatEventDate(ev.event_date);
  const timeRange = ev.start_time && ev.end_time ? `${ev.start_time} – ${ev.end_time}` : (ev.start_time || "");

  const article = document.createElement("article");
  article.className = `event-card reveal ${delayClass}`;
  article.innerHTML = `
    <div class="event-date-badge"><span class="event-month">${month}</span><span class="event-day">${day}</span></div>
    <div class="event-content">
      ${ev.tag ? `<span class="event-tag">${escapeHtml(ev.tag)}</span>` : ""}
      <h3 class="event-title">${escapeHtml(ev.title)}</h3>
      <p class="event-desc">${escapeHtml(ev.description || "")}</p>
      <div class="event-meta">
        ${timeRange ? `<span><i class="fa-regular fa-clock"></i> ${escapeHtml(timeRange)}</span>` : ""}
        ${ev.location ? `<span><i class="fa-solid fa-location-dot"></i> ${escapeHtml(ev.location)}</span>` : ""}
      </div>
      <button type="button" class="btn btn-purple btn-sm reg-open-btn" data-event-id="${ev.id}" data-event-title="${escapeHtml(ev.title)}">
        ${escapeHtml(ev.cta_label || "Register Now")}
      </button>
    </div>
  `;
  return article;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

async function renderEvents() {
  const events = await loadEvents();

  if (eventsLoading) eventsLoading.remove();

  if (!events.length) {
    eventsGrid.innerHTML = `<p style="text-align:center;width:100%;opacity:0.7;">No upcoming events right now — check back soon!</p>`;
    return;
  }

  const delayClasses = ["delay-1", "delay-2", "delay-3"];
  events.forEach((ev, i) => {
    const card = renderEventCard(ev, delayClasses[i % 3]);
    eventsGrid.appendChild(card);

    // Hook into the existing scroll-reveal + card entrance observers if present
    if (typeof revealObserver !== "undefined") revealObserver.observe(card);
    if (typeof cardObserver !== "undefined") {
      card.style.opacity = "0";
      card.style.transform = "translateY(40px) scale(0.96)";
      card.style.transition = `opacity 0.6s ease ${i * 0.12}s, transform 0.6s ease ${i * 0.12}s`;
      cardObserver.observe(card);
    }
  });

  // Wire up registration buttons (delegated, but direct since cards are freshly created)
  eventsGrid.querySelectorAll(".reg-open-btn").forEach(btn => {
    btn.addEventListener("click", () => openRegModal(btn.dataset.eventId, btn.dataset.eventTitle));
  });
}

function openRegModal(eventId, eventTitle) {
  regEventId.value = eventId;
  regEventTitle.textContent = eventTitle;
  regModalOverlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeRegModal() {
  regModalOverlay.classList.remove("open");
  document.body.style.overflow = "";
  regForm.reset();
  regSuccess.style.display = "none";
}

regModalClose?.addEventListener("click", closeRegModal);
regModalOverlay?.addEventListener("click", (e) => {
  if (e.target === regModalOverlay) closeRegModal();
});

regForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  regSubmitBtn.disabled = true;
  regSubmitBtn.textContent = "Submitting…";

  const { error } = await saveEventRegistration({
    eventId:  regEventId.value,
    fullName: document.getElementById("regFullName").value.trim(),
    email:    document.getElementById("regEmail").value.trim(),
    phone:    document.getElementById("regPhone").value.trim(),
    notes:    document.getElementById("regNotes").value.trim(),
  });

  regSubmitBtn.disabled = false;
  regSubmitBtn.textContent = "Submit Registration";

  if (error) {
    alert("Something went wrong submitting your registration. Please try again or contact us directly.");
    return;
  }

  regSuccess.style.display = "block";
  setTimeout(closeRegModal, 2000);
});

renderEvents();
