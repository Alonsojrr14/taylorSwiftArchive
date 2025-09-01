class TaylorArchive {
  constructor() {
    this.rawData = []
    this.filteredData = []
    this.currentFilters = {
      era: "",
      type: "",
      interviewer: "",
    }

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
    }

    this.init()
  }

  async init() {
    this.setupEventListeners()
    await this.loadData()
  }

  setupEventListeners() {
    this.elements.eraFilter.addEventListener("change", (e) => {
      this.currentFilters.era = e.target.value
      this.applyFilters()
    })

    this.elements.typeFilter.addEventListener("change", (e) => {
      this.currentFilters.type = e.target.value
      this.applyFilters()
    })

    this.elements.interviewerFilter.addEventListener("change", (e) => {
      this.currentFilters.interviewer = e.target.value
      this.applyFilters()
    })

    this.elements.clearFilters.addEventListener("click", () => {
      this.clearAllFilters()
    })

    this.elements.retryButton.addEventListener("click", () => {
      this.loadData()
    })

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.clearAllFilters()
      }
    })
  }

  async loadData() {
    try {
      this.showLoading()

      const response = await fetch("dataTaylor.json")
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const data = await response.json()
      if (!Array.isArray(data)) throw new Error("Invalid data format")

      this.rawData = data.map((it) => {
        let name =
          (it.subject && String(it.subject).trim()) ||
          (it.outlet && String(it.outlet).trim()) ||
          null

        if (!name) {
          try {
            if (it.url) name = new URL(it.url).hostname
          } catch { /* ignore */ }
        }
        if (!name) name = "(sem título)"

        const eraKey = it.era ? String(it.era).toUpperCase().trim() : ""
        const eraUI = this.eraCanonical[eraKey] || "Sem Era"

        const notesOrContent = it.content || it.notes || null

        const date = it.date || null

        return {
          Name: name,
          Type: it.tag || null,
          Interviewer: it.author || null,
          Era: eraUI,
          "Conduct Date": date,
          "Release Date": date,
          "Notes/Content": notesOrContent,
          Link: it.url || null,
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
    this.elements.loading.style.display = "block"
    this.elements.error.style.display = "none"
    this.elements.content.style.display = "none"
    this.elements.emptyState.style.display = "none"
  }

  showError(message) {
    this.elements.loading.style.display = "none"
    this.elements.error.style.display = "block"
    this.elements.content.style.display = "none"
    this.elements.emptyState.style.display = "none"
    this.elements.errorMessage.textContent = message
  }

  showContent() {
    this.elements.loading.style.display = "none"
    this.elements.error.style.display = "none"
    this.elements.content.style.display = "block"
    this.elements.emptyState.style.display = "none"
  }

  showEmptyState() {
    this.elements.loading.style.display = "none"
    this.elements.error.style.display = "none"
    this.elements.content.style.display = "none"
    this.elements.emptyState.style.display = "block"
  }

  populateFilters() {
    const eras = new Set()
    const types = new Set()
    const interviewers = new Set()

    this.rawData.forEach((item) => {
      if (item.Era) eras.add(item.Era)
      if (item.Type) types.add(item.Type)
      if (item.Interviewer) interviewers.add(item.Interviewer)
    })

    this.clearSelectOptions(this.elements.eraFilter)
    this.clearSelectOptions(this.elements.typeFilter)
    this.clearSelectOptions(this.elements.interviewerFilter)

    ;[...eras].sort().forEach((era) => this.addSelectOption(this.elements.eraFilter, era))
    ;[...types].sort().forEach((type) => this.addSelectOption(this.elements.typeFilter, type))
    ;[...interviewers].sort().forEach((interviewer) =>
      this.addSelectOption(this.elements.interviewerFilter, interviewer)
    )
  }

  clearSelectOptions(select) {
    while (select.children.length > 1) {
      select.removeChild(select.lastChild)
    }
  }

  addSelectOption(select, value) {
    const option = document.createElement("option")
    option.value = value
    option.textContent = value
    select.appendChild(option)
  }

  applyFilters() {
    this.filteredData = this.rawData.filter((item) => {
      if (!item.Name || !item.Type) return false

      const eraMatch = !this.currentFilters.era || item.Era === this.currentFilters.era
      const typeMatch = !this.currentFilters.type || item.Type === this.currentFilters.type
      const interviewerMatch =
        !this.currentFilters.interviewer || item.Interviewer === this.currentFilters.interviewer

      return eraMatch && typeMatch && interviewerMatch
    })

    this.updateResultsCount()
    this.renderContent()
  }

  clearAllFilters() {
    this.currentFilters = { era: "", type: "", interviewer: "" }
    this.elements.eraFilter.value = ""
    this.elements.typeFilter.value = ""
    this.elements.interviewerFilter.value = ""
    this.applyFilters()
  }

  updateResultsCount() {
    const count = this.filteredData.length
    const total = this.rawData.length
    this.elements.resultsCount.textContent = `Mostrando ${count} de ${total} itens`
  }

  renderContent() {
    if (this.filteredData.length === 0) {
      this.showEmptyState()
      return
    }

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
      "The Life of a Showgirl", // novo
      "Sem Era",
    ]

    const sortedGrouped = {}
    eraOrder.forEach((era) => {
      if (grouped[era]) sortedGrouped[era] = grouped[era]
    })

    Object.keys(grouped).forEach((era) => {
      if (!sortedGrouped[era]) sortedGrouped[era] = grouped[era]
    })

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
        <span class="card__type">${this.escapeHtml(item.Type)}</span>
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
          <span class="card__meta-value">${this.escapeHtml(item.Interviewer) || "—"}</span>
        </div>
      </div>
      
      <div class="card__content">
        <p class="card__description">${this.escapeHtml(item["Notes/Content"]) || "Sem descrição disponível."}</p>
        ${item.Link ? `<a href="${this.escapeHtml(item.Link)}" target="_blank" rel="noopener noreferrer" class="card__link">🔗 Ver fonte</a>` : ""}
      </div>
    `

    return card
  }

  getEraClass(era) {
    return this.eraColors[era] || "default"
  }

  formatDate(dateString) {
    if (!dateString) return null
    try {
      const date = new Date(dateString)
      const valid = !isNaN(date.getTime())
      if (!valid) return dateString
      return date.toLocaleDateString("pt-BR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return dateString
    }
  }

  escapeHtml(text) {
    if (!text) return ""
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new TaylorArchive()
})

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered: ", registration)
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError)
      })
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
