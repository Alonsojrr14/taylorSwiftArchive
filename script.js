class TaylorArchive {
  constructor() {
    this.rawData = []
    this.filteredData = []
    this.currentFilters = { era: "", type: "", interviewer: "" }

    this.elements = {
      loading: document.getElementById("loading"),
      error: document.getElementById("error"),
      content: document.getElementById("content"),
      emptyState: document.getElementById("emptyState"),
      resultsCount: document.getElementById("resultsCount"),
      eraFilter: document.getElementById("eraFilter"),
      typeFilter: document.getElementById("typeFilter"),
      interviewerFilter: document.getElementById("interviewerFilter"),
      clearFilters: document.getElementById("clearFilters"),
      retryButton: document.getElementById("retryButton"),
      errorMessage: document.getElementById("errorMessage"),
    }

    this.eraColors = {
      "Pre-Debut": "pre-debut",
      Debut: "debut",
      Fearless: "fearless",
      "Fearless (Taylor's Version)": "fearless-tv",
      "Speak Now": "speak-now",
      "Speak Now (Taylor's Version)": "speak-now-tv",
      Red: "red",
      "Red (Taylor's Version)": "red-tv",
      1989: "1989",
      "1989 (Taylor's Version)": "1989-tv",
      Reputation: "reputation",
      Lover: "lover",
      Folklore: "folklore",
      Evermore: "evermore",
      Midnights: "midnights",
      "The Tortured Poets Department": "ttpd",
      "The Life of a Showgirl": "tloas",
    }

    this.eraCanonical = {
      "PRE-DEBUT ERA": "Pre-Debut",
      "DEBUT ERA": "Debut",
      "FEARLESS ERA": "Fearless",
      "FEARLESS TV ERA": "Fearless (Taylor's Version)",
      "SPEAK NOW ERA": "Speak Now",
      "SPEAK NOW TV ERA": "Speak Now (Taylor's Version)",
      "RED ERA": "Red",
      "RED TV ERA": "Red (Taylor's Version)",
      "1989 ERA": "1989",
      "1989 TV ERA": "1989 (Taylor's Version)",
      "REP ERA": "Reputation",
      "LOVER ERA": "Lover",
      "FOLKLORE ERA": "Folklore",
      "EVERMORE ERA": "Evermore",
      "MIDNIGHTS ERA": "Midnights",
      "TTPD ERA": "The Tortured Poets Department",
      "TLOAS ERA": "The Life of a Showgirl",
      "TLOAS": "The Life of a Showgirl",
      "THE LIFE OF A SHOWGIRL": "The Life of a Showgirl",
      "TTPD": "The Tortured Poets Department",
    }

    this.normalizeEraName = (raw) => {
      if (!raw) return null
      const key = String(raw).normalize("NFKC").replace(/\s+/g, " ").trim().toUpperCase()
      if (this.eraCanonical[key]) return this.eraCanonical[key]
      const uiMatch = Object.values(this.eraCanonical).find((v) => v.toUpperCase() === key)
      if (uiMatch) return uiMatch
      return String(raw).trim()
    }

    this.init()
  }

  async init() {
    this.setupEventListeners()
    await this.loadData()
  }

  setupEventListeners() {
    this.elements.eraFilter?.addEventListener("change", (e) => {
      this.currentFilters.era = e.target.value
      this.applyFilters()
    })
    this.elements.typeFilter?.addEventListener("change", (e) => {
      this.currentFilters.type = e.target.value
      this.applyFilters()
    })
    this.elements.interviewerFilter?.addEventListener("change", (e) => {
      this.currentFilters.interviewer = e.target.value
      this.applyFilters()
    })
    this.elements.clearFilters?.addEventListener("click", () => this.clearAllFilters())
    this.elements.retryButton?.addEventListener("click", () => this.loadData())
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") this.clearAllFilters() })
  }

  pick(obj, ...keys) {
    for (const k of keys) {
      const v = obj?.[k]
      if (v !== undefined && v !== null && String(v).trim() !== "") return String(v).trim()
    }
    return null
  }

  async loadData() {
    try {
      this.showLoading()

      const response = await fetch("dataTaylor.json")
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      if (!Array.isArray(data)) throw new Error("Invalid data format")

      this.rawData = data.map((it) => {
        const subject = this.pick(it, "subject", "Name", "name", "title", "Title")
        const outlet  = this.pick(it, "outlet", "Outlet", "source", "Source")
        const url     = this.pick(it, "url", "Link", "link")
        const tag     = this.pick(it, "tag", "Type", "type", "category", "Category")
        const author  = this.pick(it, "author", "Interviewer", "Author")
        const date    = this.pick(it, "date", "Conduct Date", "Release Date")
        const notes   = this.pick(it, "content", "Notes/Content", "notes", "description", "Description")

        const eraRaw  = this.pick(it, "era", "Era", "ERA")
        const eraUI   = eraRaw ? this.normalizeEraName(eraRaw) : "Sem Era"

        let name = subject || outlet || null
        if (!name && url) { try { name = new URL(url).hostname } catch {} }
        if (!name) {
          const pieces = []
          if (outlet) pieces.push(outlet)
          if (tag) pieces.push(tag)
          name = pieces.length ? pieces.join(" — ") : "(sem título)"
        }

        return {
          Name: name,
          Type: tag || null,
          Interviewer: author || null,
          Era: eraUI,
          "Conduct Date": date || null,
          "Release Date": date || null,
          "Notes/Content": notes || null,
          Link: url || null,
          _raw: it,
        }
      })

      this.populateFilters()
      this.applyFilters()

    } catch (error) {
      this.showError(error.message)
    }
  }

  showLoading() {
    this.elements.loading && (this.elements.loading.style.display = "block")
    this.elements.error && (this.elements.error.style.display = "none")
    this.elements.content && (this.elements.content.style.display = "none")
    this.elements.emptyState && (this.elements.emptyState.style.display = "none")
  }
  showError(message) {
    this.elements.loading && (this.elements.loading.style.display = "none")
    this.elements.error && (this.elements.error.style.display = "block")
    this.elements.content && (this.elements.content.style.display = "none")
    this.elements.emptyState && (this.elements.emptyState.style.display = "none")
    if (this.elements.errorMessage) this.elements.errorMessage.textContent = message
  }
  showContent() {
    this.elements.loading && (this.elements.loading.style.display = "none")
    this.elements.error && (this.elements.error.style.display = "none")
    this.elements.content && (this.elements.content.style.display = "block")
    this.elements.emptyState && (this.elements.emptyState.style.display = "none")
  }
  showEmptyState() {
    this.elements.loading && (this.elements.loading.style.display = "none")
    this.elements.error && (this.elements.error.style.display = "none")
    this.elements.content && (this.elements.content.style.display = "none")
    this.elements.emptyState && (this.elements.emptyState.style.display = "block")
  }

  populateFilters() {
    const eras = new Set()
    const types = new Set()
    const interviewers = new Set()
  
    this.rawData.forEach((item) => {
      if (item.Era) eras.add(item.Era)
      types.add(item.Type || "—")
      interviewers.add(item.Interviewer || "—")
    })
  
    this.clearSelectOptions(this.elements.eraFilter)
    this.clearSelectOptions(this.elements.typeFilter)
    this.clearSelectOptions(this.elements.interviewerFilter)
  
    const eraOrder = [
      "Pre-Debut",
      "Debut",
      "Fearless",
      "Fearless (Taylor's Version)",
      "Speak Now",
      "Speak Now (Taylor's Version)",
      "Red",
      "Red (Taylor's Version)",
      "1989",
      "1989 (Taylor's Version)",
      "Reputation",
      "Lover",
      "Folklore",
      "Evermore",
      "Midnights",
      "The Tortured Poets Department",
      "The Life of a Showgirl",
      "Sem Era",
    ]
  
    eraOrder.forEach((era) => {
      if (eras.has(era)) {
        this.addSelectOption(this.elements.eraFilter, era)
      }
    })
  
    eras.forEach((era) => {
      if (!eraOrder.includes(era)) {
        this.addSelectOption(this.elements.eraFilter, era)
      }
    })
  
    ;[...types].sort().forEach((type) =>
      this.addSelectOption(this.elements.typeFilter, type)
    )
    ;[...interviewers].sort().forEach((i) =>
      this.addSelectOption(this.elements.interviewerFilter, i)
    )
  }
  

  clearSelectOptions(select) {
    if (!select) return
    while (select.children.length > 1) select.removeChild(select.lastChild)
  }
  addSelectOption(select, value) {
    if (!select) return
    const option = document.createElement("option")
    option.value = value
    option.textContent = value
    select.appendChild(option)
  }

  applyFilters() {
    this.filteredData = this.rawData.filter((item) => {
      if (!item.Name) return false
      const eraMatch = !this.currentFilters.era || item.Era === this.currentFilters.era
      const typeMatch = !this.currentFilters.type || (item.Type || "—") === this.currentFilters.type
      const interviewerMatch =
        !this.currentFilters.interviewer || (item.Interviewer || "—") === this.currentFilters.interviewer
      return eraMatch && typeMatch && interviewerMatch
    })

    this.updateResultsCount()
    this.renderContent()
  }

  clearAllFilters() {
    this.currentFilters = { era: "", type: "", interviewer: "" }
    this.elements.eraFilter && (this.elements.eraFilter.value = "")
    this.elements.typeFilter && (this.elements.typeFilter.value = "")
    this.elements.interviewerFilter && (this.elements.interviewerFilter.value = "")
    this.applyFilters()
  }

  updateResultsCount() {
    const count = this.filteredData.length
    const total = this.rawData.length
    this.elements.resultsCount && (this.elements.resultsCount.textContent = `Mostrando ${count} de ${total} itens`)
  }

  renderContent() {
    if (!this.elements.content) return
    if (this.filteredData.length === 0) { this.showEmptyState(); return }

    this.showContent()
    const groupedData = this.groupByEra(this.filteredData)
    this.elements.content.innerHTML = ""

    Object.entries(groupedData).forEach(([era, items]) => {
      const eraSection = this.createEraSection(era, items)
      this.elements.content.appendChild(eraSection)
    })
  }

  groupByEra(data) {
    const grouped = {}
    data.forEach((item) => {
      const era = item.Era || "Sem Era"
      if (!grouped[era]) grouped[era] = []
      grouped[era].push(item)
    })

    const eraOrder = [
      "Pre-Debut","Debut","Fearless","Fearless (Taylor's Version)",
      "Speak Now","Speak Now (Taylor's Version)","Red","Red (Taylor's Version)",
      "1989","1989 (Taylor's Version)","Reputation","Lover","Folklore","Evermore",
      "Midnights","The Tortured Poets Department","The Life of a Showgirl","Sem Era",
    ]

    const sortedGrouped = {}
    eraOrder.forEach((era) => { if (grouped[era]) sortedGrouped[era] = grouped[era] })
    Object.keys(grouped).forEach((era) => { if (!sortedGrouped[era]) sortedGrouped[era] = grouped[era] })
    return sortedGrouped
  }

  createEraSection(era, items) {
    const section = document.createElement("section")
    section.className = "era-section"

    const title = document.createElement("h2")
    title.className = `era-title era-title--${this.getEraClass(era)}`
    title.textContent = era
    section.appendChild(title)

    const grid = document.createElement("div")
    grid.className = "cards-grid"

    items.forEach((item) => {
      const card = this.createCard(item, era)
      grid.appendChild(card)
    })

    section.appendChild(grid)
    return section
  }

  createCard(item, era) {
    const card = document.createElement("article")
    card.className = `card card--${this.getEraClass(era)}`
    card.innerHTML = `
      <header class="card__header">
        <h3 class="card__title">${this.escapeHtml(item.Name)}</h3>
        <span class="card__type">${this.escapeHtml(item.Type || "—")}</span>
      </header>
      <div class="card__meta">
        <div class="card__meta-item">
          <span class="card__meta-label">Data da Entrevista:</span>
          <span class="card__meta-value">${this.formatDate(item["Conduct Date"]) || "—"}</span>
        </div>
        <div class="card__meta-item">
          <span class="card__meta-label">Publicação:</span>
          <span class="card__meta-value">${this.formatDate(item["Release Date"]) || "—"}</span>
        </div>
        <div class="card__meta-item">
          <span class="card__meta-label">Entrevistador:</span>
          <span class="card__meta-value">${this.escapeHtml(item.Interviewer || "—")}</span>
        </div>
      </div>
      <div class="card__content">
        <p class="card__description">${this.escapeHtml(item["Notes/Content"] || "Sem descrição disponível.")}</p>
        ${item.Link ? `<a href="${this.escapeHtml(item.Link)}" target="_blank" rel="noopener noreferrer" class="card__link">🔗 Ver fonte</a>` : ""}
      </div>
    `
    return card
  }

  getEraClass(era) { return this.eraColors[era] || "default" }

  formatDate(dateString) {
    if (!dateString) return null
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return dateString
      return date.toLocaleDateString("pt-BR", { year: "numeric", month: "long", day: "numeric" })
    } catch { return dateString }
  }

  escapeHtml(text) {
    if (!text) return ""
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }
}

document.addEventListener("DOMContentLoaded", () => new TaylorArchive())

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const resp = await fetch("/sw.js", { method: "HEAD" })
      if (resp.ok) {
        const reg = await navigator.serviceWorker.register("/sw.js")
        console.log("SW registered:", reg)
      } else {
        console.log("SW skip: /sw.js não encontrado")
      }
    } catch (err) {
      console.log("SW skip:", err?.message || err)
    }
  })
}

const filtersSection = document.querySelector(".filters-section")
const showFiltersBtn = document.getElementById("showFiltersBtn")
window.addEventListener("scroll", function () {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  if (!filtersSection || !showFiltersBtn) return
  if (scrollTop > 50) {
    filtersSection.classList.add("oculto")
    showFiltersBtn.style.display = "block"
  } else {
    filtersSection.classList.remove("oculto")
    showFiltersBtn.style.display = "none"
  }
})
if (showFiltersBtn) {
  showFiltersBtn.addEventListener("click", function (e) {
    e.stopPropagation()
    if (!filtersSection) return
    filtersSection.classList.remove("oculto")
    showFiltersBtn.style.display = "none"
    window.scrollTo({ top: 0, behavior: "smooth" })
  })
}
