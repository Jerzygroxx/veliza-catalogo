import type { SeedProduct } from '../types'

const blusa = (name: string, price: number, extra: Partial<SeedProduct> = {}): SeedProduct => ({
  name,
  price,
  category: 'blusas-y-tops',
  ...extra,
})
const body = (name: string, price: number, extra: Partial<SeedProduct> = {}): SeedProduct => ({
  name,
  price,
  category: 'bodies',
  ...extra,
})
const vestido = (name: string, price: number, extra: Partial<SeedProduct> = {}): SeedProduct => ({
  name,
  price,
  category: 'vestidos',
  ...extra,
})

export const products: SeedProduct[] = [
  // Blusas y Tops (11)
  blusa('Boss', 35000),
  blusa('Gladys', 36000),
  blusa('Venecia', 34000),
  blusa('Kenda', 34000),
  blusa('Buzo encaje', 46000),
  blusa('Blusa nudo', 35000),
  blusa('Blusa manga corta', 26000),
  blusa('Blusa Hebilla', 35000),
  blusa('Blusa manga larga', 30000),
  blusa('Lía', 45000, { featured: true }),
  blusa('Top Blonda Copa', 50000, { featured: true }),
  // Bodies (12)
  body('Body Wooz', 40000),
  body('Body básico', 38000),
  body('Body Varilla W', 48000),
  body('Body malla', 43000),
  body('Body M.L', 48000, {
    featured: true,
    colors: [
      { name: 'Rojo', swatch: '#B3261E' },
      { name: 'Blanco', swatch: '#FFFFFF' },
      { name: 'Negro', swatch: '#000000' },
      { name: 'Amarillo pastel', swatch: '#F6E7A1' },
      { name: 'Azul', swatch: '#2F5DA8' },
      { name: 'Rosado', swatch: '#F2B8C6' },
      { name: 'Animal print' },
    ],
  }),
  body('Body Hillary', 40000),
  body('Body Cuello U', 40000),
  body('Body Cloe', 40000),
  body('Body Lazo Hombro', 40000),
  body('Body Xiomara', 43000),
  body('Body Sky', 38000),
  body('Body encaje', 47000),
  // Vestidos (6)
  vestido('Vestido ojalillo', 80000, { featured: true }),
  vestido('Amanda', 56000),
  vestido('Lazo Corto', 55000),
  vestido('Babero Corto', 58000),
  vestido('Babero Parte Trasera', 58000),
  vestido('Elida', 55000),
]
