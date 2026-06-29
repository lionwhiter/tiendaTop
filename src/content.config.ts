import { z, defineCollection } from 'astro:content'

const productsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    price: z.number(),
    currency: z.string().default('USD'),
    image: z.string(),
    category: z.string(),
    sku: z.string(),
    stock: z.number(),
    badge: z.enum(['Nuevo', 'Oferta', 'Más Vendido', 'Edición Limitada']).optional(),
    originalPrice: z.number().optional(),
  }),
})

const settingsCollection = defineCollection({
  type: 'data',
  schema: z.object({
    webhookUrl: z.string().default('https://hook.eu1.make.com/tu_id_de_webhook'),
    whatsappNumber: z.string().default('34611223344'),
    enableAutoWebhook: z.boolean().default(false),
  }),
})

export const collections = {
  products: productsCollection,
  settings: settingsCollection,
}
