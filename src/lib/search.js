export function initSearch(products) {
  const overlay = document.getElementById('search-overlay')
  const input = document.getElementById('search-input')
  const results = document.getElementById('search-results')
  const closeBtn = document.getElementById('search-close')
  const recentList = document.getElementById('search-recent')
  const RECENT_KEY = 'TiendaTop_recent_v1'

  if (!overlay) return

  const openers = [
    'search-toggle', 'search-toggle-mobile',
    'search-toggle-bottom',
  ]

  openers.forEach(id => {
    const el = document.getElementById(id)
    if (el) el.addEventListener('click', () => {
      overlay.classList.remove('hidden')
      setTimeout(() => input?.focus(), 100)
    })
  })

  closeBtn?.addEventListener('click', () => overlay.classList.add('hidden'))

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') overlay.classList.add('hidden')
  })

  let fuse = null
  import('fuse.js').then(({ default: Fuse }) => {
    fuse = new Fuse(products, {
      keys: [
        { name: 'title', weight: 0.5 },
        { name: 'category', weight: 0.3 },
        { name: 'description', weight: 0.15 },
      ],
      threshold: 0.35,
      includeScore: true,
    })
  })

  function getRecents() {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || [] } catch { return [] }
  }

  function saveRecent(term) {
    const recents = [term, ...getRecents().filter(s => s !== term)].slice(0, 6)
    localStorage.setItem(RECENT_KEY, JSON.stringify(recents))
    renderRecents()
  }

  function renderRecents() {
    if (!recentList) return
    const recents = getRecents()
    if (recents.length === 0) {
      recentList.innerHTML = ''
      return
    }
    recentList.innerHTML = `
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-bold uppercase text-gray-500">Búsquedas recientes</span>
        <button id="clear-recents" class="text-xs text-red-500 hover:underline">Borrar todo</button>
      </div>
      <div class="space-y-1">
        ${recents.map(term => `<button class="recent-chip block w-full text-left px-3 py-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-xs text-gray-700 transition shadow-sm">${term}</button>`).join('')}
      </div>
    `
    document.getElementById('clear-recents')?.addEventListener('click', () => {
      localStorage.removeItem(RECENT_KEY)
      renderRecents()
    })
    recentList.querySelectorAll('.recent-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        input.value = btn.textContent
        doSearch(btn.textContent)
      })
    })
  }

  function doSearch(query) {
    if (!results || !fuse) return
    if (!query.trim()) {
      results.innerHTML = ''
      return
    }
    const hits = fuse.search(query).map(r => r.item)
    if (hits.length === 0) {
      results.innerHTML = `<p class="text-gray-500 text-sm p-4 text-center">No se encontraron resultados para "${query}"</p>`
      return
    }
    results.innerHTML = `<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">${hits.map(p => `
      <a href="/productos/${p.sku.toLowerCase()}/" class="p-3 bg-white hover:bg-gray-50 border border-gray-200 hover:border-amber-500/50 rounded-2xl flex items-center gap-3.5 transition active:scale-[0.98] shadow-sm">
        <img src="${p.image}" alt="${p.title}" class="w-14 h-14 rounded-xl object-cover bg-gray-100 shrink-0" loading="lazy">
        <div class="flex-1 min-w-0">
          <span class="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">${p.category}</span>
          <h4 class="font-bold text-gray-900 text-sm truncate">${p.title}</h4>
          <span class="font-black text-amber-600 text-sm">$${p.price.toFixed(2)}</span>
        </div>
      </a>
    `).join('')}</div>`
  }

  input?.addEventListener('input', e => doSearch(e.target.value))
  input?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && input.value.trim()) {
      saveRecent(input.value.trim())
      doSearch(input.value.trim())
    }
  })

  renderRecents()
}
