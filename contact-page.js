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
