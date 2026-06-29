const CART_KEY = 'TiendaTop_cart_v1'
const CART_EVENT = 'cart-updated'

export function getCart() {
  try {
    const data = localStorage.getItem(CART_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart))
  window.dispatchEvent(new CustomEvent(CART_EVENT, { detail: cart }))
}

export function addToCart(product, quantity = 1) {
  const cart = getCart()
  const existing = cart.find(item => item.sku === product.sku)
  if (existing) {
    existing.quantity += quantity
  } else {
    cart.push({ ...product, quantity })
  }
  saveCart(cart)
  showToast(`"${product.title}" añadido al carrito`)
}

export function removeFromCart(sku) {
  const cart = getCart().filter(item => item.sku !== sku)
  saveCart(cart)
}

export function updateQuantity(sku, delta) {
  const cart = getCart().map(item => {
    if (item.sku === sku) {
      const next = item.quantity + delta
      return next > 0 ? { ...item, quantity: next } : null
    }
    return item
  }).filter(Boolean)
  saveCart(cart)
}

export function clearCart() {
  saveCart([])
}

export function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.quantity, 0)
}

export function getCartTotal() {
  return getCart().reduce((sum, item) => sum + item.price * item.quantity, 0)
}

function showToast(message) {
  let toast = document.getElementById('cart-toast')
  if (!toast) {
    toast = document.createElement('div')
    toast.id = 'cart-toast'
    toast.className = 'fixed top-4 right-4 z-50 bg-emerald-500 text-slate-950 font-bold text-sm px-5 py-3 rounded-xl shadow-2xl shadow-emerald-500/30 transition-all duration-300 translate-y-[-100px] opacity-0'
    document.body.appendChild(toast)
  }
  toast.textContent = message
  toast.classList.remove('translate-y-[-100px]', 'opacity-0')
  toast.classList.add('translate-y-0', 'opacity-100')
  setTimeout(() => {
    toast.classList.add('translate-y-[-100px]', 'opacity-0')
    toast.classList.remove('translate-y-0', 'opacity-100')
  }, 2500)
}

// Check for existing cart on load
document.addEventListener('DOMContentLoaded', () => {
  const cart = getCart()
  if (cart.length > 0 && !sessionStorage.getItem('cart-toast-shown')) {
    sessionStorage.setItem('cart-toast-shown', '1')
    showToast('Tienes productos guardados en tu carrito. ¿Quieres continuar?')
  }
})

// Re-export CART_EVENT for other modules
export { CART_EVENT }
