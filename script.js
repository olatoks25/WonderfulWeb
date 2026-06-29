/**
 * =====================================================
 * Rccg Wonderful Mega CHURCH – script.js
 * Handles: Preloader, Sticky Nav, Mobile Menu,
 *          Scroll Reveal, Testimonies Slider,
 *          Active Nav Links, Back-to-Top, Form
 * =====================================================
 */

"use strict";

/* ──────────────────────────────────────────────────
   1. PRELOADER
   ────────────────────────────────────────────────── */
window.addEventListener("load", () => {
  const preloader = document.getElementById("preloader");
  if (!preloader) return;

  // Give a brief delay so the animation is visible
  setTimeout(() => {
    preloader.classList.add("hidden");
    // Remove from DOM after transition
    preloader.addEventListener("transitionend", () => preloader.remove(), { once: true });
  }, 900);
});


/* ──────────────────────────────────────────────────
   2. STICKY HEADER ON SCROLL
   ────────────────────────────────────────────────── */
const header = document.getElementById("header");

function handleHeaderScroll() {
  if (window.scrollY > 60) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
}

window.addEventListener("scroll", handleHeaderScroll, { passive: true });
handleHeaderScroll(); // Run once on page load


/* ──────────────────────────────────────────────────
   3. MOBILE HAMBURGER MENU
   ────────────────────────────────────────────────── */
const hamburger = document.getElementById("hamburger");
const navLinks  = document.getElementById("navLinks");

hamburger?.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  hamburger.classList.toggle("open", isOpen);
  hamburger.setAttribute("aria-expanded", isOpen);
  document.body.style.overflow = isOpen ? "hidden" : "";
});

// Close menu when a nav link is clicked
navLinks?.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    hamburger.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  });
});

// Close menu on outside click
document.addEventListener("click", (e) => {
  if (!header.contains(e.target) && navLinks.classList.contains("open")) {
    navLinks.classList.remove("open");
    hamburger.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
});


/* ──────────────────────────────────────────────────
   4. ACTIVE NAV LINK ON SCROLL (Intersection Observer)
   ────────────────────────────────────────────────── */
const sections = document.querySelectorAll("section[id], div[id]");
const navItems = document.querySelectorAll(".nav-link");

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        navItems.forEach(link => {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${id}`) {
            link.classList.add("active");
          }
        });
      }
    });
  },
  { threshold: 0.35 }
);

sections.forEach(section => sectionObserver.observe(section));


/* ──────────────────────────────────────────────────
   5. SCROLL REVEAL ANIMATIONS
   ────────────────────────────────────────────────── */
const revealElements = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        // Unobserve after revealing for performance
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
);

revealElements.forEach(el => revealObserver.observe(el));


/* ──────────────────────────────────────────────────
   6. TESTIMONIES SLIDER
   ────────────────────────────────────────────────── */
(function initSlider() {
  const track   = document.getElementById("testimoniesTrack");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const dots    = document.querySelectorAll(".dot");

  if (!track) return;

  const cards      = track.querySelectorAll(".testimony-card");
  const totalCards = cards.length;
  let   current    = 0;
  let   autoTimer;

  function getVisibleCount() {
    if (window.innerWidth <= 480)  return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  function getMaxIndex() {
    return Math.max(0, totalCards - getVisibleCount());
  }

  function goTo(index) {
    const max = getMaxIndex();
    current   = Math.max(0, Math.min(index, max));

    // Calculate card width including gap (2rem = 32px)
    const gap       = 32;
    const cardWidth = cards[0].offsetWidth + gap;
    track.style.transform = `translateX(-${current * cardWidth}px)`;

    // Update dots
    dots.forEach((dot, i) => dot.classList.toggle("active", i === current));
  }

  function next() { goTo(current >= getMaxIndex() ? 0 : current + 1); }
  function prev() { goTo(current <= 0 ? getMaxIndex() : current - 1); }

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(next, 5000);
  }

  nextBtn?.addEventListener("click", () => { next(); startAuto(); });
  prevBtn?.addEventListener("click", () => { prev(); startAuto(); });

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => { goTo(i); startAuto(); });
  });

  // Touch / swipe support
  let touchStartX = 0;
  track.addEventListener("touchstart", e => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  track.addEventListener("touchend", e => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 40) {
      diff > 0 ? next() : prev();
      startAuto();
    }
  }, { passive: true });

  // Recalculate on resize
  window.addEventListener("resize", () => goTo(current), { passive: true });

  goTo(0);
  startAuto();
})();


/* ──────────────────────────────────────────────────
   7. BACK TO TOP BUTTON
   ────────────────────────────────────────────────── */
const backToTop = document.getElementById("backToTop");

window.addEventListener("scroll", () => {
  if (!backToTop) return;
  backToTop.classList.toggle("visible", window.scrollY > 400);
}, { passive: true });

backToTop?.addEventListener("click", (e) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: "smooth" });
});


/* ──────────────────────────────────────────────────
   8. CONTACT FORM — Gmail + WhatsApp send
   ────────────────────────────────────────────────── */
const contactForm = document.getElementById("contactForm");
const formSuccess = document.getElementById("formSuccess");

function getFormData() {
  return {
    firstName: document.getElementById("firstName")?.value.trim() || "",
    lastName:  document.getElementById("lastName")?.value.trim()  || "",
    email:     document.getElementById("email")?.value.trim()     || "",
    phone:     document.getElementById("phone")?.value.trim()     || "",
    subject:   document.getElementById("subject")?.value.trim()   || "",
    message:   document.getElementById("message")?.value.trim()   || "",
  };
}

function showSuccess() {
  if (formSuccess) {
    formSuccess.style.display = "block";
    formSuccess.style.opacity = "1";
    setTimeout(() => { formSuccess.style.display = "none"; }, 5000);
  }
  contactForm?.reset();
}

// Save submission to Supabase (fire-and-forget, never blocks the Gmail/WhatsApp flow)
async function saveToSupabase(d) {
  if (typeof saveContactSubmission !== "function") {
    console.warn("backend.js not loaded — skipping database save.");
    return;
  }
  await saveContactSubmission(d);
}

// Send via Gmail
document.getElementById("sendEmailBtn")?.addEventListener("click", () => {
  if (!contactForm.checkValidity()) { contactForm.reportValidity(); return; }
  const d = getFormData();
  saveToSupabase(d);
  const subject = encodeURIComponent(`Website Message from ${d.firstName} ${d.lastName}`);
  const body    = encodeURIComponent(
    `Name: ${d.firstName} ${d.lastName}\nEmail: ${d.email}\nPhone: ${d.phone}\n\nMessage:\n${d.message}`
  );
  window.open(
    `https://mail.google.com/mail/?view=cm&to=rccgwonderfulmega48@gmail.com&su=${subject}&body=${body}`,
    "_blank"
  );
  showSuccess();
});

// Send via WhatsApp
document.getElementById("sendWhatsappBtn")?.addEventListener("click", () => {
  if (!contactForm.checkValidity()) { contactForm.reportValidity(); return; }
  const d = getFormData();
  saveToSupabase(d);
  const text = encodeURIComponent(
    `Hello RCCG Wonderful Mega Church 🙏\n\nName: ${d.firstName} ${d.lastName}\nEmail: ${d.email}\nPhone: ${d.phone}\n\nMessage:\n${d.message}`
  );
  window.open(`https://wa.me/2348134185707?text=${text}`, "_blank");
  showSuccess();
});


/* ──────────────────────────────────────────────────
   9. COPY BANK ACCOUNT NUMBER
   ────────────────────────────────────────────────── */
const copyBtn = document.getElementById("copyAccBtn");

copyBtn?.addEventListener("click", (e) => {
  e.preventDefault();

  const accountNumber = "1234567890";
  if (navigator.clipboard) {
    navigator.clipboard.writeText(accountNumber).then(() => {
      const original = copyBtn.textContent;
      copyBtn.textContent = "✓ Copied!";
      copyBtn.style.background = "#2a7a4e";
      setTimeout(() => {
        copyBtn.textContent = original;
        copyBtn.style.background = "";
      }, 2000);
    });
  }
});


/* ──────────────────────────────────────────────────
   10. SMOOTH SCROLL FOR ALL ANCHOR LINKS
   ────────────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    const targetId = this.getAttribute("href");
    if (targetId === "#") return;

    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();
    const headerH = header ? header.offsetHeight : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - headerH - 8;

    window.scrollTo({ top, behavior: "smooth" });
  });
});


/* ──────────────────────────────────────────────────
   11. PARALLAX EFFECT ON HERO IMAGE
   ────────────────────────────────────────────────── */
const heroImg = document.querySelector(".hero-img");

if (heroImg) {
  window.addEventListener("scroll", () => {
    const scrolled = window.scrollY;
    if (scrolled < window.innerHeight) {
      heroImg.style.transform = `scale(1) translateY(${scrolled * 0.25}px)`;
    }
  }, { passive: true });
}


/* ──────────────────────────────────────────────────
   12. FORM INPUT FOCUS ANIMATION
   ────────────────────────────────────────────────── */
document.querySelectorAll(".form-group input, .form-group textarea").forEach(input => {
  input.addEventListener("focus", () => {
    input.parentElement.classList.add("focused");
  });
  input.addEventListener("blur", () => {
    input.parentElement.classList.remove("focused");
  });
});

console.log("✦ Rccg Wonderful Mega Church — Website loaded successfully.");


/* ──────────────────────────────────────────────────
   13. DIRECTIONAL REVEAL (left / right slide-in)
   ────────────────────────────────────────────────── */
const dirRevealEls = document.querySelectorAll(".reveal-left, .reveal-right");

const dirObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        dirObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -30px 0px" }
);
dirRevealEls.forEach(el => dirObserver.observe(el));


/* ──────────────────────────────────────────────────
   14. ANIMATED COUNTER — stat numbers count up
   ────────────────────────────────────────────────── */
function animateCounter(el) {
  const target  = el.textContent.replace(/[^0-9]/g, "");
  const suffix  = el.textContent.replace(/[0-9]/g, "");
  const end     = parseInt(target, 10);
  if (isNaN(end)) return;

  let start     = 0;
  const duration = 1800;
  const step    = 16;
  const increment = end / (duration / step);

  const timer = setInterval(() => {
    start += increment;
    if (start >= end) {
      el.textContent = end.toLocaleString() + suffix;
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(start).toLocaleString() + suffix;
    }
  }, step);
}

const statsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll(".stat-num").forEach(animateCounter);
        statsObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);
const aboutStats = document.querySelector(".about-stats");
if (aboutStats) statsObserver.observe(aboutStats);


/* Form handler consolidated in section 8 */


/* ──────────────────────────────────────────────────
   16. CURSOR TRAIL sparkle effect
   ────────────────────────────────────────────────── */
(function cursorTrail() {
  let lastSpawn = 0;
  document.addEventListener("mousemove", (e) => {
    const now = Date.now();
    if (now - lastSpawn < 80) return;
    lastSpawn = now;

    const dot = document.createElement("div");
    dot.style.cssText = `
      position:fixed;
      left:${e.clientX}px;
      top:${e.clientY}px;
      width:6px;height:6px;
      border-radius:50%;
      background:var(--gold);
      pointer-events:none;
      z-index:9998;
      transform:translate(-50%,-50%) scale(1);
      transition:transform 0.6s ease,opacity 0.6s ease;
      opacity:0.7;
    `;
    document.body.appendChild(dot);
    requestAnimationFrame(() => {
      dot.style.transform = "translate(-50%,-50%) scale(2.5)";
      dot.style.opacity   = "0";
    });
    setTimeout(() => dot.remove(), 650);
  });
})();


/* ──────────────────────────────────────────────────
   17. TYPING ANIMATION for hero subtitle
   ────────────────────────────────────────────────── */
(function typeHeroSubtitle() {
  const el = document.querySelector(".hero-subtitle");
  if (!el) return;

  const text = el.textContent;
  el.textContent = "";
  el.style.opacity = "1";

  let i = 0;
  const type = () => {
    if (i < text.length) {
      el.textContent += text[i++];
      setTimeout(type, 38);
    }
  };
  // Start after hero fade-in completes
  setTimeout(type, 1200);
})();


/* ──────────────────────────────────────────────────
   18. SECTION ENTRANCE: scale + fade for cards
   ────────────────────────────────────────────────── */
const cardEls = document.querySelectorAll(".sermon-card, .event-card, .give-card, .testimony-card");
cardEls.forEach((card, i) => {
  card.style.opacity   = "0";
  card.style.transform = "translateY(40px) scale(0.96)";
  card.style.transition= `opacity 0.6s ease ${i * 0.12}s, transform 0.6s ease ${i * 0.12}s`;
});

const cardObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity   = "1";
        entry.target.style.transform = "translateY(0) scale(1)";
        cardObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);
cardEls.forEach(card => cardObserver.observe(card));

console.log("✦ All animations + links loaded — Rccg Wonderful Mega Church");


/* ──────────────────────────────────────────────────
   19. LIGHT / DARK MODE TOGGLE
   ────────────────────────────────────────────────── */
(function initTheme() {
  const html        = document.documentElement;
  const toggleBtn   = document.getElementById("themeToggle");
  const STORAGE_KEY = "wmc-theme";

  // Load saved preference, default to dark
  const saved = localStorage.getItem(STORAGE_KEY) || "dark";
  html.setAttribute("data-theme", saved);

  function applyTheme(theme) {
    html.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);

    // Update aria-label
    if (toggleBtn) {
      toggleBtn.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      );
    }

    // Update scrolled header bg based on theme
    const header = document.getElementById("header");
    if (header) {
      if (theme === "light") {
        header.style.setProperty("--header-scrolled-bg", "rgba(255,248,245,0.97)");
      } else {
        header.style.setProperty("--header-scrolled-bg", "rgba(26,8,8,0.97)");
      }
    }
  }

  // Apply on load
  applyTheme(saved);

  // Toggle on button click
  toggleBtn?.addEventListener("click", () => {
    const current = html.getAttribute("data-theme") || "dark";
    applyTheme(current === "dark" ? "light" : "dark");

    // Small bounce animation on toggle
    toggleBtn.style.transform = "scale(0.9)";
    setTimeout(() => { toggleBtn.style.transform = ""; }, 150);
  });

  // Also support system preference on first visit
  if (!localStorage.getItem(STORAGE_KEY)) {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(prefersDark ? "dark" : "light");
  }

  // Listen for system preference changes
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    // Only auto-switch if user hasn't manually toggled
    if (!localStorage.getItem(STORAGE_KEY)) {
      applyTheme(e.matches ? "dark" : "light");
    }
  });
})();

/* ──────────────────────────────────────────────────
   20. PAGE EXIT TRANSITION (smooth out before nav)
   ────────────────────────────────────────────────── */
document.querySelectorAll('a[href]').forEach(link => {
  const href = link.getAttribute('href');
  // Only internal page links (not anchors, not external)
  if (href && !href.startsWith('#') && !href.startsWith('http') &&
      !href.startsWith('mailto') && !href.startsWith('tel') &&
      href.endsWith('.html')) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const target = this.getAttribute('href');
      document.body.style.opacity = '0';
      document.body.style.transform = 'translateY(-10px)';
      document.body.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      setTimeout(() => { window.location.href = target; }, 300);
    });
  }
});


/* ──────────────────────────────────────────────────
   21. SERMON FILTER TABS
   ────────────────────────────────────────────────── */
const filterBtns = document.querySelectorAll('.filter-btn');
const sermonCards = document.querySelectorAll('.sermon-card[data-cat]');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.getAttribute('data-filter');
    sermonCards.forEach(card => {
      if (filter === 'all' || card.getAttribute('data-cat') === filter) {
        card.classList.remove('hidden');
        card.style.animation = 'fadeUp 0.4s ease forwards';
      } else {
        card.classList.add('hidden');
      }
    });
  });
});