// ---------- Mobile menu (same behaviour as index) ----------
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

menuToggle.addEventListener("click", () => {
  const open = navMenu.classList.toggle("active");
  menuToggle.classList.toggle("active", open);
  menuToggle.setAttribute("aria-expanded", open);
});
navMenu.addEventListener("click", (e) => {
  if (e.target.closest("a")) {
    navMenu.classList.remove("active");
    menuToggle.classList.remove("active");
    menuToggle.setAttribute("aria-expanded", false);
  }
});

// ---------- Form ----------
const form = document.getElementById("reservationForm");
const successBox = document.getElementById("resSuccess");
const successText = document.getElementById("successText");
const dateInput = document.getElementById("date");
const timeSelect = document.getElementById("time");
const partySelect = document.getElementById("party");

const pad = (n) => String(n).padStart(2, "0");
const toISO = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// can't book in the past
dateInput.min = toISO(new Date());

function formatTime(h, m) {
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${pad(m)} ${suffix}`;
}

// Opening hours from the footer: Mon-Fri 8-22, Sat-Sun 9-23.
// Last booking is one hour before closing, every 30 minutes.
function buildTimeSlots() {
  if (!dateInput.value) return;
  const chosen = new Date(dateInput.value + "T00:00");
  const weekend = chosen.getDay() === 0 || chosen.getDay() === 6;
  const open = weekend ? 9 : 8;
  const close = weekend ? 23 : 22;

  const now = new Date();
  const isToday = toISO(now) === dateInput.value;
  const nowMinutes = now.getHours() * 60 + now.getMinutes() + 30;

  timeSelect.innerHTML = '<option value="">Select time</option>';
  for (let mins = open * 60; mins <= (close - 1) * 60; mins += 30) {
    if (isToday && mins < nowMinutes) continue;
    const label = formatTime(Math.floor(mins / 60), mins % 60);
    timeSelect.add(new Option(label, label));
  }
  if (timeSelect.options.length === 1) {
    timeSelect.options[0].text = "No times left today";
  }
  timeSelect.disabled = false;
}
dateInput.addEventListener("change", buildTimeSlots);

// ---------- Validation ----------
const rules = {
  date: (v) => (v ? "" : "Please choose a date."),
  time: (v) => (v ? "" : "Please choose a time."),
  name: (v) => (v.trim().length >= 2 ? "" : "Please enter your name."),
  phone: (v) =>
    /^\+?[\d\s()-]{7,}$/.test(v.trim())
      ? ""
      : "Please enter a valid phone number.",
};

function validateField(id) {
  const input = document.getElementById(id);
  const msg = rules[id](input.value);
  const field = input.closest(".field");
  field.classList.toggle("invalid", Boolean(msg));
  document.getElementById("err-" + id).textContent = msg;
  return !msg;
}

Object.keys(rules).forEach((id) => {
  const input = document.getElementById(id);
  input.addEventListener("blur", () => validateField(id));
  input.addEventListener("input", () => {
    if (input.closest(".field").classList.contains("invalid"))
      validateField(id);
  });
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const results = Object.keys(rules).map(validateField);
  if (results.includes(false)) {
    form.querySelector(".invalid input, .invalid select")?.focus();
    return;
  }

  // TODO: send the data to your server here, e.g.
  // fetch("/api/reservations", { method: "POST", body: new FormData(form) })
  const data = Object.fromEntries(new FormData(form));
  const prettyDate = new Date(data.date + "T00:00").toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    },
  );
  const people = data.party === "1" ? "1 person" : `${data.party} people`;
  const firstName = data.name.trim().split(" ")[0];

  successText.textContent = `Thanks, ${firstName}! We've saved a table for ${people} on ${prettyDate} at ${data.time}. See you soon!`;
  form.hidden = true;
  successBox.hidden = false;
});

document.getElementById("resAgain").addEventListener("click", () => {
  form.reset();
  partySelect.value = "2";
  timeSelect.innerHTML = '<option value="">Select date first</option>';
  timeSelect.disabled = true;
  form
    .querySelectorAll(".invalid")
    .forEach((f) => f.classList.remove("invalid"));
  form.querySelectorAll(".field-error").forEach((p) => (p.textContent = ""));
  successBox.hidden = true;
  form.hidden = false;
  dateInput.focus();
});
