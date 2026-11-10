/* ============================================================
   SITE SETTINGS: change these when the business details are ready.
   ============================================================ */
const CONFIG = {
  businessName: "LiftEase SG",
  // Mobile number in international format, digits only (65 + 8 digits).
  phone: "6591234567",
  // How the number is shown on the page.
  phoneDisplay: "9123 4567",
};

/* Base fares (SGD). Keep these in sync with the price list in index.html. */
const FARES = {
  "appt-1":    { label: "Appointment, one-way", base: 45 },
  "appt-2":    { label: "Appointment, two-way", base: 85, twoWay: true },
  "dialysis":  { label: "Dialysis", base: 45, note: "Per one-way trip. The monthly package is $900 for 12 round trips." },
  "discharge": { label: "Hospital discharge", base: 55, note: "Includes 45 min waiting." },
  "airport-1": { label: "Airport transfer, one-way", base: 60 },
  "airport-2": { label: "Airport transfer, two-way", base: 115, twoWay: true },
  "charter":   { label: "Hourly charter", hourly: 55, fullDay: 400 },
  "jb-1":      { label: "Johor Bahru, one-way", base: 160, note: "Includes tolls." },
  "jb-2":      { label: "Johor Bahru, two-way", base: 290, twoWay: true, note: "Includes tolls and 3 hrs waiting." },
  "other":     { label: "Other", quote: true },
};

const SURCHARGE = { sunday: 10, lateNight: 15, urgent: 10 };

/* ---------- Apply phone number everywhere ---------- */
document.querySelectorAll(".js-phone-link").forEach((a) => (a.href = `tel:+${CONFIG.phone}`));
document.querySelectorAll(".js-wa-link").forEach((a) => (a.href = `https://wa.me/${CONFIG.phone}`));
document.querySelectorAll(".js-phone-display").forEach((el) => (el.textContent = CONFIG.phoneDisplay));
document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- Mobile nav ---------- */
const toggle = document.querySelector(".nav-toggle");
const nav = document.getElementById("site-nav");
toggle.addEventListener("click", () => {
  const open = toggle.getAttribute("aria-expanded") === "true";
  toggle.setAttribute("aria-expanded", String(!open));
  nav.classList.toggle("open", !open);
});
nav.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    toggle.setAttribute("aria-expanded", "false");
    nav.classList.remove("open");
  })
);

/* ---------- Helpers ---------- */
function openWhatsApp(text) {
  const url = `https://wa.me/${CONFIG.phone}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noopener");
}

function validate(form) {
  const errorBox = form.querySelector(".form-error");
  const invalid = [];
  form.querySelectorAll("input, select, textarea").forEach((el) => {
    if (el.closest("[hidden]")) return;
    const ok = el.checkValidity();
    el.setAttribute("aria-invalid", ok ? "false" : "true");
    if (!ok) invalid.push(el);
  });
  if (invalid.length) {
    const names = invalid.map((el) => form.querySelector(`label[for="${el.id}"]`)?.childNodes[0].textContent.trim()).filter(Boolean);
    errorBox.textContent = `Please check: ${names.join(", ")}.`;
    errorBox.hidden = false;
    invalid[0].focus();
    return false;
  }
  errorBox.hidden = true;
  return true;
}

function showSuccess(form, msg) {
  let box = form.querySelector(".form-success");
  if (!box) {
    box = document.createElement("div");
    box.className = "form-success";
    box.setAttribute("role", "status");
    form.querySelector(".form-actions").after(box);
  }
  box.textContent = msg;
}

function formatDate(value) {
  if (!value) return "";
  const d = new Date(`${value}T00:00`);
  return d.toLocaleDateString("en-SG", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

/* ---------- Booking form ---------- */
const booking = document.getElementById("booking-form");
const typeSel = document.getElementById("b-type");
const dateInp = document.getElementById("b-date");
const timeInp = document.getElementById("b-time");
const hoursSel = document.getElementById("b-hours");
const returnField = document.querySelector(".js-return-field");
const hoursField = document.querySelector(".js-hours-field");
const estValue = document.getElementById("estimate-value");
const estNote = document.getElementById("estimate-note");

// Earliest selectable date: today
const today = new Date();
dateInp.min = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

function estimate() {
  const fare = FARES[typeSel.value];
  returnField.hidden = !(fare && fare.twoWay);
  hoursField.hidden = typeSel.value !== "charter";

  if (!fare) {
    estValue.textContent = "N/A";
    estNote.textContent = "Choose a trip type to see an estimate.";
    return null;
  }
  if (fare.quote) {
    estValue.textContent = "Quote";
    estNote.textContent = "We'll call you with a price.";
    return null;
  }

  let total;
  if (fare.hourly) {
    const hrs = parseInt(hoursSel.value, 10);
    total = hrs >= 8 ? fare.fullDay : hrs * fare.hourly;
  } else {
    total = fare.base;
  }

  const extras = [];
  if (dateInp.value) {
    const d = new Date(`${dateInp.value}T00:00`);
    if (d.getDay() === 0) { total += SURCHARGE.sunday; extras.push(`Sunday +$${SURCHARGE.sunday}`); }
  }
  if (timeInp.value) {
    const h = parseInt(timeInp.value.split(":")[0], 10);
    if (h >= 23 || h < 6) { total += SURCHARGE.lateNight; extras.push(`late night +$${SURCHARGE.lateNight}`); }
  }
  if (dateInp.value && timeInp.value) {
    const pickup = new Date(`${dateInp.value}T${timeInp.value}`);
    const hoursAway = (pickup - new Date()) / 36e5;
    if (hoursAway >= 0 && hoursAway < 3) { total += SURCHARGE.urgent; extras.push(`urgent +$${SURCHARGE.urgent}`); }
  }

  estValue.textContent = `$${total}`;
  const parts = [];
  if (fare.note) parts.push(fare.note);
  if (extras.length) parts.push(`Includes ${extras.join(", ")}.`);
  parts.push("Local trips up to 25 km. ERP, parking and public holiday charges are extra.");
  estNote.textContent = parts.join(" ");
  return total;
}

[typeSel, dateInp, timeInp, hoursSel].forEach((el) => el.addEventListener("change", estimate));

booking.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!validate(booking)) return;
  const f = new FormData(booking);
  const fare = FARES[f.get("type")];
  const est = estimate();

  const lines = [
    `Hi ${CONFIG.businessName}, I'd like to request a booking:`,
    "",
    `Trip: ${fare.label}`,
    `Date: ${formatDate(f.get("date"))}`,
    `Pickup time: ${f.get("time")}`,
    `From: ${f.get("pickup")}`,
    `To: ${f.get("dropoff")}`,
  ];
  if (fare.twoWay && f.get("return")) lines.push(`Return pickup: ${f.get("return")}`);
  if (f.get("type") === "charter") lines.push(`Hours: ${f.get("hours")}`);
  lines.push(
    `Wheelchair: ${f.get("chair")}`,
    `Companions: ${f.get("companions")}`,
    "",
    `Contact: ${f.get("name")} (${f.get("mobile")})`
  );
  if (f.get("passenger")) lines.push(`Passenger: ${f.get("passenger")}`);
  if (f.get("notes")) lines.push(`Notes: ${f.get("notes")}`);
  if (est) lines.push("", `Website estimate: $${est}`);

  openWhatsApp(lines.join("\n"));
  showSuccess(booking, `WhatsApp should open with your booking details. If it doesn't, please call us at ${CONFIG.phoneDisplay}.`);
});

/* ---------- Enquiry form ---------- */
const enquiry = document.getElementById("enquiry-form");
enquiry.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!validate(enquiry)) return;
  const f = new FormData(enquiry);
  const text = [
    `Hi ${CONFIG.businessName}, I have an enquiry.`,
    "",
    `Topic: ${f.get("topic")}`,
    `Message: ${f.get("message")}`,
    "",
    `Name: ${f.get("name")}`,
    `Mobile: ${f.get("mobile")}`,
    `Preferred contact: ${f.get("reach")}`,
  ].join("\n");
  openWhatsApp(text);
  showSuccess(enquiry, `WhatsApp should open with your message. Or call us at ${CONFIG.phoneDisplay}.`);
});
