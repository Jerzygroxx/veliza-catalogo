export type Crop = { left: number; top: number; width: number; height: number }

export type SeedCategory = { name: string; slug: string; order: number }

export type SeedProduct = {
  name: string
  /** slug de la categoría */
  category: string
  price: number
  colors?: { name: string; swatch?: string }[]
  featured?: boolean
  description?: string
  /** página del PDF del catálogo (1 = portada) y recortes de cada foto */
  source?: { page: number; crops: Crop[] }
}

export type SiteSettingsSeed = {
  whatsappNumber: string
  instagramUrl: string
  tiktokUrl: string
  priceNotice: string
  antifraudNotice: string
  aboutShort: string
  aboutStory: string
  mission: string
  vision: string
  howToBuySteps: { text: string }[]
  deliveryOptions: { text: string }[]
  exchangePolicies: { text: string }[]
}

export type SeedData = {
  categories: SeedCategory[]
  products: SeedProduct[]
  siteSettings: SiteSettingsSeed
}

export type ImageLoader = (product: SeedProduct) => Promise<Buffer[]>
