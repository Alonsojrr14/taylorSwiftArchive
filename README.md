# Taylor Swift Archive

An interactive and responsive archive of **Taylor Swift interviews**.  

👉 **[Live demo here](https://alonsojrr14.github.io/taylorSwiftArchive/)**  

Browse and filter by **era**, **type of content**, or **interviewer**. Each era has its own **color palette**, and each entry displays a **link** and **summary**. Optimized for both **desktop and mobile**.

---

## ✨ Features

- Filter by **era**, **type**, and **interviewer**
- **Responsive design** (mobile-first)
- Unique color palettes for each era
- Direct links + short summaries
- Simple, static setup (HTML/CSS/JS only)

---

## 🗂 Project structure

```
taylorSwiftArchive/
├─ index.html        # Main page (HTML)
├─ style.css         # Styling and era color palettes (CSS)
├─ script.js         # Filtering and rendering logic (JS)
└─ dataTaylor.json   # Interviews database
```

---

## 🚀 Running locally

This is a **static app** — no build tools or dependencies required.

1. Clone the repository:
   ```bash
   git clone https://github.com/Alonsojrr14/taylorSwiftArchive.git
   cd taylorSwiftArchive
   ```
2. Open `index.html` in your browser **or** serve it locally:
   ```bash
   # With Python 3
   python -m http.server 5173
   # then go to http://localhost:5173
   ```

---

## 🧾 Data format (`dataTaylor.json`)

The archive uses JSON entries to describe each interview. Example:

```json
{
  "title": "XYZ Radio Interview",
  "date": "2023-10-21",
  "era": "Midnights",
  "type": "Radio Interview",
  "interviewer": "Jane Doe",
  "summary": "Taylor discusses creative process and behind-the-scenes of the album.",
  "link": "https://example.com/interview",
  "thumbnail": "https://example.com/cover.jpg"
}
```

### Tips
- Keep **era names consistent** (`Fearless (TV)`, `1989 (TV)`, `Midnights`, etc.)
- Use ISO dates: `YYYY-MM-DD`
- Summaries: 1–2 sentences max
- Make sure all **links** are valid
- Prefer lightweight images for `thumbnail` (≤ 200 KB)

---

## 🔎 How it works

- `script.js` loads `dataTaylor.json`, renders the list, and applies filters in memory  
- `style.css` defines era-based colors and responsive rules  
- `index.html` provides structure and UI elements for filtering  

---

## 🧰 Roadmap (ideas)

- [ ] Text search (title & summary)  
- [ ] Badges/tags for era and type  
- [ ] Sorting by date (newest/oldest)  
- [ ] Counters per filter (e.g. number of interviews per era)  
- [ ] Pagination or lazy loading  
- [ ] Manual dark mode  

---

## 🤝 Contributing

Contributions are welcome!  

1. Open an **issue** describing your idea  
2. Fork and create a branch:  
   ```bash
   git checkout -b feat/your-feature
   ```
3. Submit a PR with a clear description  

---

## 📄 License

Add a license of your choice (e.g., [MIT](https://choosealicense.com/licenses/mit/)).  
If using MIT, create a `LICENSE` file at the root.

---

## ⚠️ Disclaimer

This project is a **fan-made archive** of Taylor Swift interviews, not affiliated with or endorsed by Taylor Swift or her team.  
Respect copyright and original sources.

---

## 🙌 Credits

Created by [@Alonsojrr14](https://github.com/Alonsojrr14).  
Thanks to the original sources of interviews and content referenced.
---

## 📚 Data Source

The interview archive is based on the community-maintained spreadsheet:  
[Original Google Sheet](https://docs.google.com/spreadsheets/d/1DuapHXlUsRBN8H7lfdLFzTelJVA0En3HbZ3_W109v04/edit?usp=sharing)

Special thanks to the contributors who compiled and organized this information.
