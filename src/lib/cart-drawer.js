import { getCart, removeFromCart, updateQuantity, clearCart, getCartTotal, CART_EVENT } from './cart.js'

function getBodySettings() {
  const body = document.body
  return {
    webhookUrl: body.dataset.webhookUrl || '',
    whatsappNumber: body.dataset.whatsappNumber || '',
    enableAutoWebhook: body.dataset.enableAutoWebhook === 'true',
  }
}

export function initCartDrawer() {
  const drawer = document.getElementById('cart-drawer')
  const overlay = document.getElementById('cart-overlay')
  const content = document.getElementById('cart-content')
  if (!drawer) return

  const openers = ['cart-toggle', 'cart-toggle-mobile', 'cart-toggle-bottom']
  openers.forEach(id => {
    document.getElementById(id)?.addEventListener('click', openDrawer)
  })

  document.getElementById('cart-close')?.addEventListener('click', closeDrawer)
  overlay?.addEventListener('click', closeDrawer)

  function openDrawer() {
    drawer.classList.remove('translate-x-full')
    overlay?.classList.remove('hidden')
    renderCart()
  }

  function closeDrawer() {
    drawer.classList.add('translate-x-full')
    overlay?.classList.add('hidden')
  }

  function updateBadges(count) {
    ['cart-badge-desktop', 'cart-badge-mobile', 'cart-badge-bottom'].forEach(id => {
      const el = document.getElementById(id)
      if (el) {
        el.textContent = count
        el.classList.toggle('hidden', count === 0)
      }
    })
  }

  function renderCart() {
    const cart = getCart()
    const total = getCartTotal()
    updateBadges(cart.reduce((s, i) => s + i.quantity, 0))

    if (cart.length === 0) {
      content.innerHTML = `
        <div class="flex flex-col items-center justify-center py-16 text-center">
          <svg class="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/></svg>
          <p class="text-gray-500 font-medium">Tu carrito está vacío</p>
          <button id="continue-shop-empty" class="mt-4 px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl active:scale-95 transition">Ir al Catálogo</button>
        </div>
      `
      document.getElementById('continue-shop-empty')?.addEventListener('click', closeDrawer)
      return
    }

    const freeThreshold = 150
    const subtotal = total
    const missingForFree = Math.max(0, freeThreshold - subtotal)
    const shipping = subtotal >= freeThreshold ? 0 : 12.50
    const grandTotal = subtotal + shipping

    content.innerHTML = `
      <div class="space-y-4">
        <!-- Free shipping bar -->
        <div class="p-3 bg-white border border-gray-200 rounded-xl">
          <div class="flex justify-between text-xs mb-1">
            <span class="font-semibold text-gray-700">${missingForFree === 0 ? '¡Envío GRATIS!' : `Faltan $${missingForFree.toFixed(2)} para envío gratis`}</span>
          </div>
          <div class="h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
            <div class="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all" style="width:${Math.min(100, (subtotal / freeThreshold) * 100)}%"></div>
          </div>
        </div>

        <!-- Cart items -->
        <div class="space-y-3 max-h-[50vh] overflow-y-auto">
          ${cart.map(item => `
            <div class="flex gap-3 p-3 bg-white border border-gray-200 rounded-xl items-center shadow-sm">
              <img src="${item.image}" alt="${item.title}" class="w-16 h-16 rounded-lg object-cover bg-gray-100 shrink-0 border border-gray-200">
              <div class="flex-1 min-w-0">
                <span class="text-[10px] font-bold text-amber-600 uppercase">${item.category}</span>
                <h4 class="font-bold text-gray-900 text-sm truncate">${item.title}</h4>
                <p class="font-black text-amber-600 text-sm mt-0.5">$${item.price.toFixed(2)}</p>
                <div class="flex items-center gap-2 mt-2">
                  <button class="cart-minus w-7 h-7 flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-200 text-xs" data-sku="${item.sku}">−</button>
                  <span class="w-7 text-center font-bold text-gray-900 text-xs">${item.quantity}</span>
                  <button class="cart-plus w-7 h-7 flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-200 text-xs" data-sku="${item.sku}">+</button>
                  <button class="cart-remove ml-auto p-1.5 text-gray-400 hover:text-red-500 transition" data-sku="${item.sku}">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Totals -->
        <div class="pt-3 border-t border-gray-200 space-y-2 text-sm">
          <div class="flex justify-between text-gray-500"><span>Subtotal</span><span class="font-semibold text-gray-900">$${subtotal.toFixed(2)}</span></div>
          <div class="flex justify-between text-gray-500"><span>Envío</span><span class="font-semibold text-amber-600">${shipping === 0 ? 'GRATIS' : `$${shipping.toFixed(2)}`}</span></div>
          <div class="flex justify-between text-lg font-black text-gray-900 pt-2 border-t border-gray-200">
            <span>Total</span>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-500">$${grandTotal.toFixed(2)}</span>
          </div>
        </div>

        <!-- Checkout form -->
        <div class="space-y-3 pt-2">
          <input id="checkout-name" type="text" placeholder="Nombre completo *" class="w-full bg-gray-100 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 placeholder:text-gray-400 text-xs outline-none focus:border-amber-500 transition">
          <input id="checkout-phone" type="tel" placeholder="Teléfono WhatsApp *" class="w-full bg-gray-100 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 placeholder:text-gray-400 text-xs outline-none focus:border-amber-500 transition">
          <input id="checkout-address" type="text" placeholder="Dirección de entrega *" class="w-full bg-gray-100 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 placeholder:text-gray-400 text-xs outline-none focus:border-amber-500 transition">
          <input id="checkout-city" type="text" placeholder="Ciudad" class="w-full bg-gray-100 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 placeholder:text-gray-400 text-xs outline-none focus:border-amber-500 transition">

          <button id="checkout-whatsapp" class="w-full min-h-[46px] bg-[#25D366] hover:bg-[#22bf5b] text-white font-extrabold text-sm rounded-xl shadow-xl shadow-[#25D366]/20 flex items-center justify-center gap-2 active:scale-95 transition">
            Pedido Rápido por WhatsApp
          </button>
          <!--button id="checkout-webhook" class="w-full min-h-[46px] bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 text-white font-extrabold text-sm rounded-xl shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2 active:scale-95 transition">
            Pagar y Confirmar (Webhook)
          </button-->
          <button id="cart-clear-btn" class="w-full text-center text-xs text-red-500 hover:underline py-1">Vaciar carrito</button>
        </div>
      </div>
    `

    // Attach event listeners
    content.querySelectorAll('.cart-minus').forEach(btn => {
      btn.addEventListener('click', () => { updateQuantity(btn.dataset.sku, -1); renderCart() })
    })
    content.querySelectorAll('.cart-plus').forEach(btn => {
      btn.addEventListener('click', () => { updateQuantity(btn.dataset.sku, 1); renderCart() })
    })
    content.querySelectorAll('.cart-remove').forEach(btn => {
      btn.addEventListener('click', () => { removeFromCart(btn.dataset.sku); renderCart() })
    })
    document.getElementById('cart-clear-btn')?.addEventListener('click', () => {
      if (confirm('¿Vaciar carrito?')) { clearCart(); renderCart() }
    })
    document.getElementById('checkout-whatsapp')?.addEventListener('click', handleWhatsApp)
    document.getElementById('checkout-webhook')?.addEventListener('click', handleWebhook)
  }

  function getShippingData() {
    const name = document.getElementById('checkout-name')?.value?.trim() || ''
    const phone = document.getElementById('checkout-phone')?.value?.trim() || ''
    const address = document.getElementById('checkout-address')?.value?.trim() || ''
    const city = document.getElementById('checkout-city')?.value?.trim() || ''
    return { fullName: name, phone, address, city }
  }

  function isFormValid(s) {
    return s.fullName.length > 2 && s.phone.length > 6 && s.address.length > 5
  }

  async function handleWhatsApp() {
    const shipping = getShippingData()
    if (!isFormValid(shipping)) {
      alert('Por favor completa Nombre, Teléfono y Dirección')
      return
    }
    const cart = getCart()
    const total = getCartTotal() + (getCartTotal() >= 150 ? 0 : 12.50)
    const { generateWhatsAppUrl } = await import('./webhook.js')
    const settings = getBodySettings()
    const url = generateWhatsAppUrl(cart, shipping, total, settings.whatsappNumber)
    window.open(url, '_blank')
  }

  async function handleWebhook() {
    const shipping = getShippingData()
    if (!isFormValid(shipping)) {
      alert('Por favor completa los datos obligatorios')
      return
    }
    const cart = getCart()
    const total = getCartTotal() + (getCartTotal() >= 150 ? 0 : 12.50)
    const { sendToWebhook } = await import('./webhook.js')
    const settings = getBodySettings()
    const res = await sendToWebhook(cart, shipping, total, settings.webhookUrl)
    if (res.success) {
      clearCart()
      renderCart()
      alert(res.message)
      closeDrawer()
    } else {
      alert(res.message)
    }
  }

  // Listen for cart updates from other tabs/windows
  window.addEventListener('storage', e => {
    if (e.key === 'TiendaTop_cart_v1') updateBadges(getCart().reduce((s, i) => s + i.quantity, 0))
  })

  // Initial badge update
  updateBadges(getCart().reduce((s, i) => s + i.quantity, 0))
}
