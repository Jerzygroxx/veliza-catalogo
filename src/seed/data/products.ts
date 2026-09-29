import type { Crop, SeedProduct } from '../types'

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

/** Recorte en píxeles de `seed-assets/pages/page-NN.png` (972×1727, `npm run seed:pages`). */
const crop = (left: number, top: number, width: number, height: number, page?: number): Crop =>
  page === undefined ? { left, top, width, height } : { left, top, width, height, page }

// Colores en BORRADOR: son los que se ven en las fotos del catálogo. Confirmar con las dueñas.
const negro = { name: 'Negro', swatch: '#000000' }
const blanco = { name: 'Blanco', swatch: '#FFFFFF' }
const beige = { name: 'Beige', swatch: '#D9C3A5' }
const cafe = { name: 'Café', swatch: '#5C3A2E' }
const rojo = { name: 'Rojo', swatch: '#B3261E' }
const vinotinto = { name: 'Vinotinto', swatch: '#6D1F2A' }
const rosado = { name: 'Rosado', swatch: '#F2B8C6' }
const amarillo = { name: 'Amarillo pastel', swatch: '#F6E7A1' }
const verdeMenta = { name: 'Verde menta', swatch: '#BFE3CF' }
const azul = { name: 'Azul', swatch: '#2F5DA8' }
const azulOscuro = { name: 'Azul oscuro', swatch: '#1F2A44' }
const gris = { name: 'Gris', swatch: '#6E6E73' }

export const products: SeedProduct[] = [
  // Blusas y Tops (11)
  blusa('Boss', 35000, {
    source: { page: 4, crops: [crop(428, 776, 484, 796), crop(40, 160, 552, 552)] },
    colors: [negro],
  }),
  blusa('Gladys', 36000, {
    source: { page: 5, crops: [crop(40, 192, 396, 636), crop(500, 192, 440, 640), crop(528, 916, 408, 688)] },
    colors: [rosado, cafe, negro],
  }),
  blusa('Venecia', 34000, {
    source: { page: 6, crops: [crop(64, 196, 424, 844), crop(532, 344, 392, 544), crop(532, 972, 392, 532)] },
    colors: [negro, cafe, blanco],
  }),
  blusa('Kenda', 34000, {
    source: { page: 7, crops: [crop(564, 432, 364, 440), crop(544, 924, 384, 640), crop(44, 212, 460, 624)] },
    colors: [rojo, negro, vinotinto, rosado, blanco],
  }),
  blusa('Buzo encaje', 46000, {
    source: { page: 8, crops: [crop(52, 160, 516, 684), crop(464, 876, 460, 728)] },
    colors: [vinotinto],
  }),
  blusa('Blusa nudo', 35000, {
    source: { page: 9, crops: [crop(40, 176, 432, 676), crop(504, 228, 448, 628), crop(500, 920, 420, 660)] },
    colors: [negro, amarillo, rosado, cafe, verdeMenta, beige, azul],
  }),
  // El catálogo le dedica dos páginas (10 y 11): es el producto "extra" de las 30 páginas.
  blusa('Blusa manga corta', 26000, {
    source: {
      page: 10,
      crops: [
        crop(32, 136, 440, 592),
        crop(496, 136, 444, 592),
        crop(28, 1052, 448, 560), // termina antes del destello decorativo de la esquina
        crop(500, 1048, 440, 596),
        crop(32, 136, 448, 596, 11),
        crop(500, 136, 440, 588, 11),
        crop(504, 1016, 436, 604, 11),
      ],
    },
    colors: [beige, rojo, rosado, cafe, negro, blanco, vinotinto],
  }),
  blusa('Blusa Hebilla', 35000, {
    source: {
      page: 12,
      crops: [crop(44, 136, 392, 632), crop(488, 136, 452, 620), crop(40, 1000, 436, 644), crop(500, 996, 440, 664)],
    },
    colors: [cafe, blanco, rojo, negro],
  }),
  blusa('Blusa manga larga', 30000, {
    // La foto de las prendas dobladas (524, 324) trae texto sobreimpreso: no se usa.
    source: { page: 13, crops: [crop(28, 188, 464, 636), crop(28, 980, 480, 656)] },
    colors: [negro, vinotinto, cafe, blanco, rojo],
  }),
  blusa('Lía', 45000, {
    featured: true,
    source: { page: 14, crops: [crop(32, 216, 460, 604), crop(512, 212, 428, 608), crop(32, 940, 448, 712)] },
    colors: [negro, vinotinto, amarillo],
  }),
  blusa('Top Blonda Copa', 50000, {
    featured: true,
    source: { page: 15, crops: [crop(64, 136, 460, 696), crop(444, 884, 476, 760)] },
    colors: [negro, blanco],
  }),
  // Bodies (12)
  body('Body Wooz', 40000, {
    source: { page: 16, crops: [crop(68, 116, 388, 768), crop(504, 204, 404, 660), crop(76, 964, 388, 636)] },
    colors: [gris],
  }),
  body('Body básico', 38000, {
    source: { page: 17, crops: [crop(56, 196, 420, 680), crop(520, 352, 404, 520), crop(516, 944, 408, 540)] },
    colors: [cafe, beige, rosado, rojo, blanco, negro, vinotinto],
  }),
  body('Body Varilla W', 48000, {
    source: { page: 18, crops: [crop(48, 136, 456, 636), crop(508, 804, 428, 824)] },
    colors: [beige, negro],
  }),
  body('Body malla', 43000, {
    source: { page: 19, crops: [crop(64, 172, 420, 812), crop(540, 424, 392, 504), crop(524, 1064, 408, 528)] },
    colors: [negro],
  }),
  body('Body M.L', 48000, {
    featured: true,
    source: { page: 20, crops: [crop(64, 84, 444, 716), crop(472, 824, 456, 748)] },
    // Colores confirmados: vienen escritos en el catálogo.
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
  body('Body Hillary', 40000, {
    // Las dos fotos de arriba vienen pegadas en el collage: se separan en x ≈ 456.
    source: { page: 21, crops: [crop(32, 136, 420, 636), crop(460, 136, 480, 636), crop(32, 992, 436, 568)] },
    colors: [azulOscuro, vinotinto, rosado],
  }),
  body('Body Cuello U', 40000, {
    source: {
      page: 22,
      crops: [crop(504, 148, 400, 564), crop(56, 152, 404, 556), crop(56, 1008, 412, 604), crop(480, 1012, 436, 596)],
    },
    colors: [blanco, rosado, cafe, rojo],
  }),
  body('Body Cloe', 40000, {
    source: {
      page: 23,
      crops: [crop(56, 188, 408, 560), crop(508, 196, 408, 552), crop(56, 936, 392, 548), crop(500, 936, 420, 564)],
    },
    colors: [negro, blanco, beige],
  }),
  body('Body Lazo Hombro', 40000, {
    source: {
      page: 24,
      crops: [crop(56, 216, 372, 512), crop(528, 220, 376, 524), crop(36, 932, 408, 560), crop(492, 936, 440, 552)],
    },
    colors: [negro, blanco, vinotinto, rojo],
  }),
  body('Body Xiomara', 43000, {
    source: {
      page: 25,
      crops: [crop(68, 236, 364, 492), crop(532, 232, 364, 496), crop(64, 956, 384, 544), crop(532, 956, 388, 544)],
    },
    colors: [negro, vinotinto, cafe],
  }),
  body('Body Sky', 38000, {
    source: {
      page: 26,
      crops: [crop(552, 200, 316, 492), crop(72, 204, 360, 480), crop(52, 964, 388, 588), crop(512, 968, 388, 588)],
    },
    colors: [blanco, vinotinto, negro, rojo],
  }),
  body('Body encaje', 47000, {
    source: { page: 27, crops: [crop(44, 128, 432, 732), crop(496, 248, 432, 572), crop(44, 984, 432, 620)] },
    colors: [negro],
  }),
  // Vestidos (6)
  vestido('Vestido ojalillo', 80000, {
    featured: true,
    source: { page: 28, crops: [crop(72, 136, 424, 700), crop(452, 912, 440, 732)] },
    colors: [verdeMenta, amarillo],
  }),
  vestido('Amanda', 56000, {
    source: {
      page: 29,
      crops: [crop(540, 152, 376, 528), crop(80, 156, 380, 532), crop(532, 940, 396, 564), crop(52, 948, 384, 544)],
    },
    colors: [negro, vinotinto, rojo, beige],
  }),
  vestido('Lazo Corto', 55000, {
    source: {
      page: 30,
      crops: [crop(532, 152, 392, 536), crop(76, 156, 388, 532), crop(64, 960, 412, 564), crop(520, 960, 404, 564)],
    },
    colors: [negro, cafe, rojo, blanco, vinotinto],
  }),
  vestido('Babero Corto', 58000, {
    source: {
      page: 31,
      crops: [crop(52, 188, 404, 524), crop(536, 188, 392, 508), crop(64, 968, 392, 564), crop(536, 972, 380, 552)],
    },
    colors: [blanco, negro, cafe, vinotinto],
  }),
  vestido('Babero Parte Trasera', 58000, {
    source: { page: 32, crops: [crop(72, 216, 388, 548), crop(524, 220, 384, 548), crop(64, 888, 408, 580)] },
    colors: [cafe, blanco, negro],
  }),
  vestido('Elida', 55000, {
    source: {
      page: 33,
      crops: [crop(516, 220, 372, 548), crop(80, 232, 364, 528), crop(56, 1016, 364, 472), crop(504, 1016, 364, 484)],
    },
    colors: [negro, blanco],
  }),
]
