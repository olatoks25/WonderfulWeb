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
  const { error } = await supabaseClient.rpc("register_contact_submission", {
    p_first_name: d.firstName,
    p_last_name:  d.lastName,
    p_email:      d.email,
    p_phone:      d.phone,
    p_subject:    d.subject,
    p_message:    d.message,
  });
  if (error) console.error("Contact save error:", error.message);
  return { error };
}

/* ──────────────────────────────────────────────────
   EVENT REGISTRATION SAVE
   ────────────────────────────────────────────────── */
async function saveEventRegistration(d) {
  if (!hasSupabase()) return { error: "no-client" };
  const { error } = await supabaseClient.rpc("register_event_registration", {
    p_event_id:  d.eventId,
    p_full_name: d.fullName,
    p_email:     d.email,
    p_phone:     d.phone,
    p_notes:     d.notes,
  });
  if (error) console.error("Registration save error:", error.message);
  return { error };
}

/* ──────────────────────────────────────────────────
   PRAYER REQUEST SAVE
   ────────────────────────────────────────────────── */
async function savePrayerRequest(d) {
  if (!hasSupabase()) return { error: "no-client" };
  const { error } = await supabaseClient.rpc("register_prayer_request", {
    p_full_name:    d.fullName,
    p_email:        d.email,
    p_phone:        d.phone,
    p_request_text: d.requestText,
    p_is_private:   d.isPrivate || false,
  });
  if (error) console.error("Prayer request save error:", error.message);
  return { error };
}

/* ──────────────────────────────────────────────────
   GIVING NOTIFICATION SAVE
   ────────────────────────────────────────────────── */
async function saveGivingRecord(d) {
  if (!hasSupabase()) return { error: "no-client" };
  const { error } = await supabaseClient.rpc("register_giving_record", {
    p_full_name:      d.fullName,
    p_email:          d.email,
    p_phone:          d.phone,
    p_giving_type:    d.givingType,
    p_amount:         d.amount || null,
    p_payment_method: d.paymentMethod || "bank_transfer",
    p_reference_note: d.referenceNote,
  });
  if (error) console.error("Giving record save error:", error.message);
  return { error };
}

/* ──────────────────────────────────────────────────
   MINISTRY REGISTRATION ("Join This Ministry" form)
   ────────────────────────────────────────────────── */
async function saveMinistryRegistration(d) {
  if (!hasSupabase()) return { error: "no-client" };
  const { error } = await supabaseClient.rpc("register_ministry_volunteer", {
    p_ministry:              d.ministry,
    p_full_name:             d.fullName,
    p_whatsapp_number:       d.whatsappNumber,
    p_reason_for_joining:    d.reasonForJoining,
    p_served_before:         d.servedBefore,
    p_served_before_details: d.servedBeforeDetails || null,
    p_skills_experience:     d.skillsExperience,
    p_availability:          d.availability,
  });
  if (error) console.error("Ministry registration save error:", error.message);
  return { error };
}

/* ──────────────────────────────────────────────────
   MEMBER REGISTRATION SAVE
   ────────────────────────────────────────────────── */
async function saveMember(d) {
  if (!hasSupabase()) return { error: "no-client" };
  const { error } = await supabaseClient.rpc("register_member", {
    p_full_name: d.fullName,
    p_email:     d.email,
    p_phone:     d.phone,
    p_dob:       d.dateOfBirth || null,
    p_address:   d.homeAddress,
  });
  if (error) console.error("Member registration save error:", error.message);
  return { error };
}

/* ──────────────────────────────────────────────────
   PRAYER WALL — load public, approved requests
   ────────────────────────────────────────────────── */
async function loadPrayerWall(limit) {
  if (!hasSupabase()) return [];
  let query = supabaseClient
    .from("prayer_requests")
    .select("id, full_name, request_text, status, pray_count, created_at")
    .eq("show_on_wall", true)
    .eq("is_private", false)
    .order("created_at", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) {
    console.error("Load prayer wall error:", error.message);
    return [];
  }
  return data || [];
}

/* ──────────────────────────────────────────────────
   PRAYER WALL — tap "I'm praying" (safe, count-only)
   ────────────────────────────────────────────────── */
async function prayForRequest(requestId) {
  if (!hasSupabase()) return { error: "no-client" };
  const { error } = await supabaseClient.rpc("increment_pray_count", { request_id: requestId });
  if (error) console.error("Pray count error:", error.message);
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
   LOAD NEXT UPCOMING EVENT (for homepage countdown)
   ────────────────────────────────────────────────── */
async function loadNextEvent() {
  if (!hasSupabase()) return null;
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabaseClient
    .from("events")
    .select("*")
    .eq("published", true)
    .gte("event_date", today)
    .order("event_date", { ascending: true })
    .limit(1);
  if (error) {
    console.error("Load next event error:", error.message);
    return null;
  }
  return (data && data[0]) || null;
}

/* ──────────────────────────────────────────────────
   PUBLIC TESTIMONY SUBMISSION (goes in unpublished, awaiting review)
   ────────────────────────────────────────────────── */
async function saveTestimony(d) {
  if (!hasSupabase()) return { error: "no-client" };
  const { error } = await supabaseClient.rpc("submit_testimony", {
    p_full_name:      d.fullName,
    p_role_label:     d.roleLabel || null,
    p_testimony_text: d.testimonyText,
    p_star_rating:    d.starRating || 5,
  });
  if (error) console.error("Testimony submission error:", error.message);
  return { error };
}

/* ──────────────────────────────────────────────────
   LOAD PUBLISHED TESTIMONIES (for about.html)
   ────────────────────────────────────────────────── */
async function loadTestimonies() {
  if (!hasSupabase()) return [];
  const { data, error } = await supabaseClient
    .from("testimonies")
    .select("*")
    .eq("published", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) {
    console.error("Load testimonies error:", error.message);
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
