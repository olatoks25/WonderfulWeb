/**
 * =====================================================
 * join-ministry-page.js — "Join This Ministry" form handler
 * Requires: backend.js loaded before this file
 * =====================================================
 */

"use strict";

function getMinistryNameFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("ministry") || "a Ministry";
}

const ministryName = getMinistryNameFromUrl();
document.getElementById("ministryNameHero").textContent = ministryName;
document.getElementById("ministryNameForm").textContent = ministryName;
document.title = `Join ${ministryName} – RCCG Wonderful Mega`;

// Show/hide the "please specify" field based on the served-before answer
document.querySelectorAll('input[name="jmServed"]').forEach(radio => {
  radio.addEventListener("change", () => {
    const wrap = document.getElementById("jmServedDetailsWrap");
    wrap.style.display = radio.value === "yes" && radio.checked ? "block" : wrap.style.display;
    if (radio.value === "no" && radio.checked) wrap.style.display = "none";
  });
});

const joinMinistryForm      = document.getElementById("joinMinistryForm");
const joinMinistrySuccess   = document.getElementById("joinMinistrySuccess");
const joinMinistrySubmitBtn = document.getElementById("joinMinistrySubmitBtn");

joinMinistryForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  joinMinistrySubmitBtn.disabled = true;
  joinMinistrySubmitBtn.textContent = "Submitting…";

  const servedValue = document.querySelector('input[name="jmServed"]:checked')?.value;
  const availabilityValue = document.querySelector('input[name="jmAvailability"]:checked')?.value;

  const { error } = await saveMinistryRegistration({
    ministry:            ministryName,
    fullName:            document.getElementById("jmFullName").value.trim(),
    whatsappNumber:      document.getElementById("jmWhatsapp").value.trim(),
    reasonForJoining:    document.getElementById("jmReason").value.trim(),
    servedBefore:        servedValue === "yes",
    servedBeforeDetails: servedValue === "yes" ? document.getElementById("jmServedDetails").value.trim() : null,
    skillsExperience:    document.getElementById("jmSkills").value.trim(),
    availability:        availabilityValue,
  });

  joinMinistrySubmitBtn.disabled = false;
  joinMinistrySubmitBtn.textContent = "Submit Application";

  if (error) {
    alert("Something went wrong submitting your application. Please try again or contact us directly.");
    return;
  }

  if (joinMinistrySuccess) {
    joinMinistrySuccess.style.display = "block";
    setTimeout(() => { joinMinistrySuccess.style.display = "none"; }, 6000);
  }
  joinMinistryForm.reset();
  document.getElementById("jmServedDetailsWrap").style.display = "none";
});
