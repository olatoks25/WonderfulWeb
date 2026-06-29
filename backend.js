/**
 * =====================================================
 * backend.js — Supabase data layer (public-facing site)
 * =====================================================
 * Handles: Contact form, Event registrations, Prayer
 * requests, Giving notifications, and loading live
 * Events/Sermons from the database.
 *
 * Requires supabase-config.js to be loaded BEFORE this file.
 * =====================================================
 */

"use strict";

function hasSupabase() {
  if (typeof supabaseClient === "undefined") {
    console.warn("Supabase client not loaded — check supabase-config.js");
    return false;
  }
  return true;
}

/* ──────────────────────────────────────────────────
   CONTACT FORM SAVE
   ────────────────────────────────────────────────── */
async function saveContactSubmission(d) {
  if (!hasSupabase()) return { error: "no-client" };
  const { error } = await supabaseClient.from("contact_submissions").insert([{
    first_name: d.firstName,
    last_name:  d.lastName,
    email:      d.email,
    phone:      d.phone,
    subject:    d.subject,
    message:    d.message,
  }]);
  if (error) console.error("Contact save error:", error.message);
  return { error };
}

/* ──────────────────────────────────────────────────
   EVENT REGISTRATION SAVE
   ────────────────────────────────────────────────── */
async function saveEventRegistration(d) {
  if (!hasSupabase()) return { error: "no-client" };
  const { error } = await supabaseClient.from("event_registrations").insert([{
    event_id:  d.eventId,
    full_name: d.fullName,
    email:     d.email,
    phone:     d.phone,
    notes:     d.notes,
  }]);
  if (error) console.error("Registration save error:", error.message);
  return { error };
}

/* ──────────────────────────────────────────────────
   PRAYER REQUEST SAVE
   ────────────────────────────────────────────────── */
async function savePrayerRequest(d) {
  if (!hasSupabase()) return { error: "no-client" };
  const { error } = await supabaseClient.from("prayer_requests").insert([{
    full_name:    d.fullName,
    email:        d.email,
    phone:        d.phone,
    request_text: d.requestText,
    is_private:   d.isPrivate || false,
  }]);
  if (error) console.error("Prayer request save error:", error.message);
  return { error };
}

/* ──────────────────────────────────────────────────
   GIVING NOTIFICATION SAVE
   ────────────────────────────────────────────────── */
async function saveGivingRecord(d) {
  if (!hasSupabase()) return { error: "no-client" };
  const { error } = await supabaseClient.from("giving_records").insert([{
    full_name:      d.fullName,
    email:          d.email,
    phone:          d.phone,
    giving_type:    d.givingType,
    amount:         d.amount || null,
    payment_method: d.paymentMethod || "bank_transfer",
    reference_note: d.referenceNote,
  }]);
  if (error) console.error("Giving record save error:", error.message);
  return { error };
}

/* ──────────────────────────────────────────────────
   LOAD LIVE EVENTS (for events.html)
   ────────────────────────────────────────────────── */
async function loadEvents() {
  if (!hasSupabase()) return [];
  const { data, error } = await supabaseClient
    .from("events")
    .select("*")
    .eq("published", true)
    .order("event_date", { ascending: true });
  if (error) {
    console.error("Load events error:", error.message);
    return [];
  }
  return data || [];
}

/* ──────────────────────────────────────────────────
   LOAD LIVE SERMONS (for sermons.html / index.html)
   ────────────────────────────────────────────────── */
async function loadSermons(limit) {
  if (!hasSupabase()) return [];
  let query = supabaseClient
    .from("sermons")
    .select("*")
    .eq("published", true)
    .order("sermon_date", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) {
    console.error("Load sermons error:", error.message);
    return [];
  }
  return data || [];
}

/* ──────────────────────────────────────────────────
   HELPERS
   ────────────────────────────────────────────────── */
function formatEventDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const day = d.getDate().toString().padStart(2, "0");
  return { month, day };
}

function formatSermonDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric" });
}
