# Unit Converter

A live unit converter built with **HTML5, CSS3, and JavaScript**.
This project is part of my Web Development Internship at **Veda Technology** (Task 15).


## 📌 About the Project

Users choose a category, pick two units from dropdowns, and type a value. The result updates instantly as they type. A side panel shows the same value in every unit of the category.

## 🎯 Objective

To practice functions, conditional logic, and form handling.

## ✨ Features

- Dropdowns for unit selection
- Live conversion on every keystroke
- Two-way conversion: type in either the "From" or the "To" box
- **6 categories:** Length, Weight, Temperature, Volume, Speed, and Area
- Swap button to exchange units and values
- Choose the number of decimal places (2, 4, 6, or 8)
- Validation for letters and invalid input
- Absolute zero check for temperature
- "All units" side panel; click a unit to use it as the target
- Copy button for the result
- Responsive layout (side by side on desktop, stacked on mobile)

## 📏 Supported Units

| Category | Units |
|---|---|
| Length | mm, cm, m, km, in, ft, yd, mi |
| Weight | mg, g, kg, metric ton, oz, lb, stone |
| Temperature | °C, °F, K |
| Volume | mL, L, tsp, tbsp, cup, gallon (US) |
| Speed | m/s, km/h, mph, knot |
| Area | cm², m², hectare, km², ft², acre |

## 🧠 How It Works

Each unit stores a **factor**: how many base units it equals. For example, in length the base unit is the meter, so `ft` has a factor of `0.3048`.

```
base   = value × fromFactor
result = base ÷ toFactor
```

This means one `convert()` function works for every pair of units, instead of writing a separate function for each pair. Temperature cannot use a single factor, so it uses small `toBase` and `fromBase` functions instead.

### Adding a new unit

Add one line to the table in `script.js`:

```js
nm: { name: "Nanometer", sym: "nm", factor: 1e-9 }
```

The dropdowns and the side panel update automatically.

## 🛠️ Technologies Used

- HTML5
- CSS3 (Grid, Flexbox, media queries)
- JavaScript (DOM, events, objects, functions)

## 📚 What I Learned

- Structuring conversion factors in an object
- Writing reusable functions instead of repeating code
- Using conditional logic for validation and for special cases like temperature
- Handling form input events for live updates
- Rounding with `toFixed()` and cleaning extra zeros with `Number()`
- Building dropdowns dynamically from data

## 📁 Project Structure

```
unit-converter/
├── index.html
├── style.css
├── script.js
└── README.md
```


## 👩‍💻 Author

**Priya Vijay Tambe**

