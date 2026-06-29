/**
 * =====================================================
 * sermons-page.js — Dynamic sermons rendering + filters
 * Requires: backend.js loaded before this file
 * NOTE: script.js's filter-tab listeners (section 21) run
 * on page load before sermon cards exist, so we re-bind
 * filtering here after cards are rendered.
 * =====================================================
 */

"use strict";

const sermonGrid    = document.getElementById("sermonGrid");
const sermonsLoading = document.getElementById("sermonsLoading");

function escapeHtmlS(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function renderSermonCard(s, delayClass) {
  const dateStr = formatSermonDate(s.sermon_date);
  const fallbackImg = "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=600&q=80";

  const article = document.createElement("article");
  article.className = `sermon-card reveal ${delayClass}`;
  article.setAttribute("data-cat", s.category || "sunday");
  article.innerHTML = `
    <div class="sermon-img-wrap">
      <img src="${escapeHtmlS(s.image_url || fallbackImg)}" alt="${escapeHtmlS(s.title)}" />
      ${s.is_new ? `<span class="sermon-badge">New</span>` : ""}
      <div class="sermon-play-overlay"><i class="fa-solid fa-play"></i></div>
    </div>
    <div class="sermon-body">
      <span class="sermon-date"><i class="fa-regular fa-calendar"></i> ${escapeHtmlS(dateStr)}</span>
      <h3 class="sermon-title">${escapeHtmlS(s.title)}</h3>
      <p class="sermon-preacher"><i class="fa-solid fa-user"></i> ${escapeHtmlS(s.preacher)}</p>
      <div class="sermon-actions">
        <a href="${s.watch_url || '#'}" target="${s.watch_url ? '_blank' : '_self'}" class="btn btn-gold btn-sm"><i class="fa-solid fa-play"></i> Watch</a>
        <a href="${s.listen_url || '#'}" target="${s.listen_url ? '_blank' : '_self'}" class="btn btn-outline btn-sm"><i class="fa-solid fa-headphones"></i> Listen</a>
      </div>
    </div>
  `;
  return article;
}

function bindSermonFilters() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".sermon-card[data-cat]");

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.getAttribute("data-filter");
      cards.forEach(card => {
        if (filter === "all" || card.getAttribute("data-cat") === filter) {
          card.classList.remove("hidden");
          card.style.animation = "fadeUp 0.4s ease forwards";
        } else {
          card.classList.add("hidden");
        }
      });
    });
  });
}

async function renderSermons() {
  const sermons = await loadSermons();

  if (sermonsLoading) sermonsLoading.remove();

  if (!sermons.length) {
    sermonGrid.innerHTML = `<p style="text-align:center;width:100%;opacity:0.7;">No sermons published yet — check back soon!</p>`;
    return;
  }

  const delayClasses = ["delay-1", "delay-2", "delay-3"];
  sermons.forEach((s, i) => {
    const card = renderSermonCard(s, delayClasses[i % 3]);
    sermonGrid.appendChild(card);

    if (typeof revealObserver !== "undefined") revealObserver.observe(card);
    if (typeof cardObserver !== "undefined") {
      card.style.opacity = "0";
      card.style.transform = "translateY(40px) scale(0.96)";
      card.style.transition = `opacity 0.6s ease ${i * 0.12}s, transform 0.6s ease ${i * 0.12}s`;
      cardObserver.observe(card);
    }
  });

  bindSermonFilters();
}

renderSermons();
