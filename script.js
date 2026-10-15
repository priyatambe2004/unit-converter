/* ---------- Conversion data ----------
   Every unit stores a "factor": how many BASE units it equals.
   Example (length, base = meter): 1 foot = 0.3048 meters, so ft.factor = 0.3048.
   To convert: value x fromFactor = base, then base / toFactor = result.
   Temperature does not work with a single factor, so it uses small functions instead. */
const categories = {
  length: {
    label: "Length", icon: "📏", from: "m", to: "ft",
    units: {
      mm: { name: "Millimeter", sym: "mm", factor: 0.001 },
      cm: { name: "Centimeter", sym: "cm", factor: 0.01 },
      m:  { name: "Meter", sym: "m", factor: 1 },
      km: { name: "Kilometer", sym: "km", factor: 1000 },
      in: { name: "Inch", sym: "in", factor: 0.0254 },
      ft: { name: "Foot", sym: "ft", factor: 0.3048 },
      yd: { name: "Yard", sym: "yd", factor: 0.9144 },
      mi: { name: "Mile", sym: "mi", factor: 1609.344 }
    }
  },
  weight: {
    label: "Weight", icon: "⚖️", from: "kg", to: "lb",
    units: {
      mg: { name: "Milligram", sym: "mg", factor: 0.000001 },
      g:  { name: "Gram", sym: "g", factor: 0.001 },
      kg: { name: "Kilogram", sym: "kg", factor: 1 },
      t:  { name: "Metric ton", sym: "t", factor: 1000 },
      oz: { name: "Ounce", sym: "oz", factor: 0.028349523125 },
      lb: { name: "Pound", sym: "lb", factor: 0.45359237 },
      st: { name: "Stone", sym: "st", factor: 6.35029318 }
    }
  },
  temperature: {
    label: "Temperature", icon: "🌡️", from: "c", to: "f", minBase: -273.15, // base unit is Celsius
    units: {
      c: { name: "Celsius", sym: "°C", toBase: (v) => v, fromBase: (b) => b },
      f: { name: "Fahrenheit", sym: "°F", toBase: (v) => ((v - 32) * 5) / 9, fromBase: (b) => (b * 9) / 5 + 32 },
      k: { name: "Kelvin", sym: "K", toBase: (v) => v - 273.15, fromBase: (b) => b + 273.15 }
    }
  },
  volume: {
    label: "Volume", icon: "🧪", from: "l", to: "gal",
    units: {
      ml:  { name: "Milliliter", sym: "mL", factor: 0.001 },
      l:   { name: "Liter", sym: "L", factor: 1 },
      tsp: { name: "Teaspoon (US)", sym: "tsp", factor: 0.00492892159375 },
      tbsp:{ name: "Tablespoon (US)", sym: "tbsp", factor: 0.01478676478125 },
      cup: { name: "Cup (US)", sym: "cup", factor: 0.2365882365 },
      gal: { name: "Gallon (US)", sym: "gal", factor: 3.785411784 }
    }
  },
  speed: {
    label: "Speed", icon: "🚀", from: "kmh", to: "mph",
    units: {
      ms:   { name: "Meter per second", sym: "m/s", factor: 1 },
      kmh:  { name: "Kilometer per hour", sym: "km/h", factor: 1 / 3.6 },
      mph:  { name: "Mile per hour", sym: "mph", factor: 0.44704 },
      kn:   { name: "Knot", sym: "kn", factor: 1852 / 3600 }
    }
  },
  area: {
    label: "Area", icon: "🗺️", from: "m2", to: "ft2",
    units: {
      cm2: { name: "Square centimeter", sym: "cm²", factor: 0.0001 },
      m2:  { name: "Square meter", sym: "m²", factor: 1 },
      ha:  { name: "Hectare", sym: "ha", factor: 10000 },
      km2: { name: "Square kilometer", sym: "km²", factor: 1000000 },
      ft2: { name: "Square foot", sym: "ft²", factor: 0.09290304 },
      ac:  { name: "Acre", sym: "ac", factor: 4046.8564224 }
    }
  }
};

/* ---------- Conversion functions ---------- */
function toBase(cat, unit, value) {
  const u = cat.units[unit];
  return u.toBase ? u.toBase(value) : value * u.factor;
}

function fromBase(cat, unit, base) {
  const u = cat.units[unit];
  return u.fromBase ? u.fromBase(base) : base / u.factor;
}

function convert(categoryKey, value, fromUnit, toUnit) {
  const cat = categories[categoryKey];
  return fromBase(cat, toUnit, toBase(cat, fromUnit, value));
}

/* ---------- Helpers ---------- */
const $ = (id) => document.getElementById(id);
const tabsEl = $("tabs"), fromValue = $("from-value"), toValue = $("to-value");
const fromUnit = $("from-unit"), toUnit = $("to-unit"), placesEl = $("places");
const messageEl = $("message"), formulaEl = $("formula"), toastEl = $("toast");
const allList = $("all-list"), allEmpty = $("all-empty");

let currentCategory = "length";
let lastEdited = "from"; // which box the person typed in last
let toastTimer;

// toFixed(places) rounds to a set number of decimals, then Number() drops extra zeros (2.5000 -> 2.5)
function format(n) {
  if (n === 0) return "0";
  const abs = Math.abs(n);
  if (abs >= 1e15 || abs < 1e-6) return n.toExponential(4).replace(/\.?0+e/, "e");
  return String(Number(n.toFixed(Number(placesEl.value))));
}

// Returns a number, null for empty/unfinished typing (like "-" or "."), or NaN for invalid text
function parseValue(text) {
  const t = text.trim().replace(/,/g, "");
  if (t === "" || /^[-+]?\.?$/.test(t)) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : NaN;
}

/* ---------- Building the page ---------- */
function buildTabs() {
  Object.entries(categories).forEach(([key, cat]) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tab";
    btn.dataset.key = key;
    btn.innerHTML = `<span aria-hidden="true">${cat.icon}</span> ${cat.label}`;
    btn.addEventListener("click", () => setCategory(key));
    tabsEl.appendChild(btn);
  });
}

function fillSelect(select, cat, selected) {
  select.innerHTML = "";
  Object.entries(cat.units).forEach(([key, u]) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = `${u.name} (${u.sym})`;
    select.appendChild(option);
  });
  select.value = selected;
}

function setCategory(key) {
  currentCategory = key;
  const cat = categories[key];
  tabsEl.querySelectorAll(".tab").forEach((t) => {
    const active = t.dataset.key === key;
    t.classList.toggle("active", active);
    t.setAttribute("aria-pressed", String(active));
  });
  fillSelect(fromUnit, cat, cat.from);
  fillSelect(toUnit, cat, cat.to);
  $("cat-name").textContent = cat.label.toLowerCase();
  update();
}

/* ---------- Main update ---------- */
function showError(text, input) {
  messageEl.textContent = text;
  input.classList.add("invalid");
  toValue.value = lastEdited === "from" ? "" : toValue.value;
  formulaEl.textContent = "Please fix the value above.";
  renderAll(null);
}

function update() {
  messageEl.textContent = "";
  fromValue.classList.remove("invalid");
  toValue.classList.remove("invalid");

  const cat = categories[currentCategory];
  const source = lastEdited === "from" ? fromValue : toValue;
  const target = lastEdited === "from" ? toValue : fromValue;
  const sourceUnit = lastEdited === "from" ? fromUnit.value : toUnit.value;
  const targetUnit = lastEdited === "from" ? toUnit.value : fromUnit.value;

  const value = parseValue(source.value);

  if (value === null) {              // empty or unfinished
    target.value = "";
    formulaEl.textContent = "Type a value to start.";
    renderAll(null);
    return;
  }
  if (Number.isNaN(value)) {         // letters or symbols
    target.value = "";
    messageEl.textContent = "Please enter a number only, like 25 or -4.5.";
    source.classList.add("invalid");
    formulaEl.textContent = "Please fix the value above.";
    renderAll(null);
    return;
  }
  // Nothing can be colder than absolute zero
  if (cat.minBase !== undefined && toBase(cat, sourceUnit, value) < cat.minBase - 1e-9) {
    target.value = "";
    messageEl.textContent = "That is below absolute zero (-273.15 °C, -459.67 °F, 0 K).";
    source.classList.add("invalid");
    formulaEl.textContent = "Please fix the value above.";
    renderAll(null);
    return;
  }

  const result = convert(currentCategory, value, sourceUnit, targetUnit);
  target.value = format(result);

  // Show the formula in the order From -> To
  const fromV = lastEdited === "from" ? value : result;
  const toV = lastEdited === "from" ? result : value;
  formulaEl.textContent = `${format(fromV)} ${cat.units[fromUnit.value].sym} = ${format(toV)} ${cat.units[toUnit.value].sym}`;

  // The "All units" list is based on the From side
  renderAll(lastEdited === "from" ? value : convert(currentCategory, value, toUnit.value, fromUnit.value));
}

function renderAll(fromAmount) {
  allList.innerHTML = "";
  allEmpty.hidden = fromAmount !== null;
  if (fromAmount === null) return;

  const cat = categories[currentCategory];
  Object.entries(cat.units).forEach(([key, u]) => {
    const li = document.createElement("li");
    if (key === toUnit.value) li.className = "target";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.innerHTML = `<span class="name"></span><span class="val"></span>`;
    btn.querySelector(".name").textContent = u.name;
    btn.querySelector(".val").textContent = `${format(convert(currentCategory, fromAmount, fromUnit.value, key))} ${u.sym}`;
    btn.addEventListener("click", () => { toUnit.value = key; lastEdited = "from"; update(); });
    li.appendChild(btn);
    allList.appendChild(li);
  });
}

/* ---------- Events ---------- */
// "input" fires on every keystroke, so the result updates live
fromValue.addEventListener("input", () => { lastEdited = "from"; update(); });
toValue.addEventListener("input", () => { lastEdited = "to"; update(); });
fromUnit.addEventListener("change", () => { lastEdited = "from"; update(); });
toUnit.addEventListener("change", () => { lastEdited = "from"; update(); });
placesEl.addEventListener("change", update);

$("swap").addEventListener("click", () => {
  const unitA = fromUnit.value;
  fromUnit.value = toUnit.value;
  toUnit.value = unitA;
  const valueA = fromValue.value;
  fromValue.value = toValue.value;
  toValue.value = valueA;
  lastEdited = "from";
  update();
});

$("reset").addEventListener("click", () => {
  fromValue.value = "";
  toValue.value = "";
  lastEdited = "from";
  setCategory(currentCategory);
  fromValue.focus();
});

$("copy").addEventListener("click", async () => {
  const text = formulaEl.textContent;
  if (!text.includes("=")) return showToast("Nothing to copy yet.");
  try {
    await navigator.clipboard.writeText(text);
    showToast("Copied!");
  } catch {
    showToast("Could not copy. Please select the text manually.");
  }
});

function showToast(message) {
  toastEl.textContent = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toastEl.textContent = ""), 2200);
}

/* ---------- Start ---------- */
buildTabs();
setCategory("length");
