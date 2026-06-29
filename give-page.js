/**
 * =====================================================
 * give-page.js — Giving notification modal logic
 * Requires: backend.js loaded before this file
 * =====================================================
 */

"use strict";

const openGiveModalBtn = document.getElementById("openGiveModalBtn");
const giveModalOverlay  = document.getElementById("giveModalOverlay");
const giveModalClose    = document.getElementById("giveModalClose");
const giveForm          = document.getElementById("giveForm");
const giveSuccess       = document.getElementById("giveSuccess");
const giveSubmitBtn     = document.getElementById("giveSubmitBtn");

function openGiveModal() {
  giveModalOverlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeGiveModal() {
  giveModalOverlay.classList.remove("open");
  document.body.style.overflow = "";
  giveForm.reset();
  giveSuccess.style.display = "none";
}

openGiveModalBtn?.addEventListener("click", openGiveModal);
giveModalClose?.addEventListener("click", closeGiveModal);
giveModalOverlay?.addEventListener("click", (e) => {
  if (e.target === giveModalOverlay) closeGiveModal();
});

giveForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  giveSubmitBtn.disabled = true;
  giveSubmitBtn.textContent = "Submitting…";

  const amountVal = document.getElementById("giveAmount").value;

  const { error } = await saveGivingRecord({
    fullName:      document.getElementById("giveFullName").value.trim(),
    email:         document.getElementById("giveEmail").value.trim(),
    phone:         document.getElementById("givePhone").value.trim(),
    givingType:    document.getElementById("giveType").value,
    amount:        amountVal ? parseFloat(amountVal) : null,
    paymentMethod: "bank_transfer",
    referenceNote: document.getElementById("giveNote").value.trim(),
  });

  giveSubmitBtn.disabled = false;
  giveSubmitBtn.textContent = "Submit";

  if (error) {
    alert("Something went wrong recording your giving. Please try again or contact us directly.");
    return;
  }

  giveSuccess.style.display = "block";
  setTimeout(closeGiveModal, 2000);
});
