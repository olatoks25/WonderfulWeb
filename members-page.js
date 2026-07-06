/**
 * =====================================================
 * members-page.js — Member registration form handler
 * Requires: backend.js loaded before this file
 * =====================================================
 */

"use strict";

const memberForm      = document.getElementById("memberForm");
const memberSuccess    = document.getElementById("memberSuccess");
const memberSubmitBtn  = document.getElementById("memberSubmitBtn");

memberForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  memberSubmitBtn.disabled = true;
  memberSubmitBtn.textContent = "Registering…";

  const { error } = await saveMember({
    fullName:     document.getElementById("memFullName").value.trim(),
    email:        document.getElementById("memEmail").value.trim(),
    phone:        document.getElementById("memPhone").value.trim(),
    dateOfBirth:  document.getElementById("memDob").value,
    homeAddress:  document.getElementById("memAddress").value.trim(),
  });

  memberSubmitBtn.disabled = false;
  memberSubmitBtn.textContent = "Register as a Member";

  if (error) {
    alert("Something went wrong submitting your registration. Please try again or contact us directly.");
    return;
  }

  if (memberSuccess) {
    memberSuccess.style.display = "block";
    setTimeout(() => { memberSuccess.style.display = "none"; }, 6000);
  }
  memberForm.reset();
});
