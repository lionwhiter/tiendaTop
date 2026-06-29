import { getCollection } from 'astro:content'

export async function GET() {
  const products = await getCollection('products')
  const index = products
    .filter(p => p.data.stock > 0)
    .map(p => ({
      sku: p.slug,
      title: p.data.title,
      price: p.data.price,
      image: p.data.image,
      category: p.data.category,
      description: p.body?.trim() || '',
      badge: p.data.badge || null,
      stock: p.data.stock,
    }))

  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json' },
  })
}
