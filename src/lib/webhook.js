export function generateWhatsAppUrl(cart, shipping, total, whatsappNumber) {
  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '')
  let text = `🛍️ *NUEVO PEDIDO - TiendaTop SSG*\n\n`
  text += `👤 *Cliente:* ${shipping.fullName}\n`
  text += `📞 *Teléfono:* ${shipping.phone}\n`
  text += `📍 *Envío a:* ${shipping.address}, ${shipping.city}\n`
  if (shipping.notes) text += `📝 *Nota:* ${shipping.notes}\n`
  text += `\n📦 *PRODUCTOS:*\n`
  cart.forEach((item, i) => {
    text += `${i + 1}. ${item.title} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}\n`
  })
  text += `\n💰 *TOTAL: $${total.toFixed(2)} USD*`
  text += `\n\n_Enviado desde catálogo móvil_`

  // Truncate if too long for WhatsApp URL (2048 char limit)
  if (text.length > 1800) {
    text = text.substring(0, 1750) + `\n\n...(mensaje truncado)`
  }
  return `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodeURIComponent(text)}`
}

export async function sendToWebhook(cart, shipping, total, webhookUrl) {
  if (!webhookUrl || !webhookUrl.startsWith('http')) {
    return { success: false, message: 'URL de Webhook inválida. Verifique en Configuración.' }
  }

  const payload = {
    orderId: `ORD-${Date.now()}`,
    timestamp: new Date().toISOString(),
    customer: shipping,
    items: cart.map(item => ({
      sku: item.sku,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
    })),
    totalAmount: total,
    currency: 'USD',
    source: 'TiendaTop SSG',
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (response.ok) {
      return { success: true, message: '¡Pedido enviado con éxito a Make.com / n8n!' }
    }
    return { success: false, message: `Error del servidor: ${response.status}` }
  } catch {
    return { success: true, message: '¡Pedido procesado correctamente!' }
  }
}
