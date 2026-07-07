/**
 * =====================================================
 * index-page.js — Homepage countdown banner
 * Requires: backend.js loaded before this file
 * =====================================================
 */

"use strict";

let countdownTargetMs = null;
let countdownIntervalId = null;

function pad2(n) {
  return String(n).padStart(2, "0");
}

function tickCountdown() {
  if (!countdownTargetMs) return;
  const now = Date.now();
  let diff = countdownTargetMs - now;

  if (diff <= 0) {
    // Event has started/passed — hide the banner rather than show a negative timer
    document.getElementById("countdownBanner").style.display = "none";
    clearInterval(countdownIntervalId);
    return;
  }

  const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
  diff -= days * (1000 * 60 * 60 * 24);
  const hours = Math.floor(diff / (1000 * 60 * 60));
  diff -= hours * (1000 * 60 * 60);
  const mins  = Math.floor(diff / (1000 * 60));
  diff -= mins * (1000 * 60);
  const secs  = Math.floor(diff / 1000);

  document.getElementById("cdDays").textContent  = pad2(days);
  document.getElementById("cdHours").textContent = pad2(hours);
  document.getElementById("cdMins").textContent  = pad2(mins);
  document.getElementById("cdSecs").textContent  = pad2(secs);
}

async function initCountdownBanner() {
  const banner = document.getElementById("countdownBanner");
  if (!banner) return;

  const ev = await loadNextEvent();
  if (!ev) return; // stays hidden — no upcoming events

  // Build a target timestamp from event_date + start_time (default midnight if no time set)
  const timePart = ev.start_time ? ev.start_time : "00:00:00";
  const target = new Date(`${ev.event_date}T${timePart}`);
  if (isNaN(target.getTime())) return;

  countdownTargetMs = target.getTime();
  if (countdownTargetMs <= Date.now()) return; // already happening/passed today

  document.getElementById("countdownEventTitle").textContent = ev.title;
  banner.style.display = "flex";

  tickCountdown();
  countdownIntervalId = setInterval(tickCountdown, 1000);
}

initCountdownBanner();
