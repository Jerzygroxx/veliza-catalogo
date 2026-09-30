import type { SiteSettingsSeed } from '../types'

export const siteSettings: SiteSettingsSeed = {
  whatsappNumber: '573189952081',
  // Usuarios confirmados por las dueñas (2026-09-30), sin los parámetros de rastreo de los enlaces compartidos.
  instagramUrl: 'https://www.instagram.com/veliza_storebq',
  tiktokUrl: 'https://www.tiktok.com/@veliza_storebq',
  priceNotice: 'Los precios varían por temporada, no manejamos precios fijos.',
  antifraudNotice: 'Solo recibimos pedidos por nuestro WhatsApp oficial: +57 318 995 2081 💕',
  aboutShort:
    'Véliza nació de una idea entre amigas, Isabella, Sara y Valerie, que soñaban con tener su propia marca. Hoy representa nuestra amistad, nuestro esfuerzo y nuestra pasión por la moda.',
  aboutStory: [
    'Véliza nació de una idea entre amigas, Isabella, Sara y Valerie, que soñaban con tener su propia marca.',
    'Lo que comenzó como una simple idea se convirtió en un proyecto lleno de ilusión, creatividad y muchas ganas de crecer juntas.',
    'Hoy, Véliza representa nuestra amistad, nuestro esfuerzo y nuestra pasión por la moda.',
    'Gracias por ser parte de este sueño 💕',
  ].join('\n\n'),
  mission:
    'En Véliza queremos ofrecer productos de calidad, con estilo y personalidad, que te hagan sentir única y segura. Nos enfocamos en brindar una experiencia de compra cercana, confiable y especial, siempre con mucho amor y dedicación.',
  vision:
    'Ser un emprendimiento reconocido y en constante crecimiento, llevando nuestra esencia a más personas, convirtiéndonos en una marca que inspire, con estilo, autenticidad y propósito.',
  howToBuySteps: [
    { text: 'Ingresa a nuestro catálogo y elige la prenda que te guste.' },
    { text: 'Envíanos la referencia, la talla y el color que deseas para confirmar la disponibilidad.' },
    { text: 'Completa tus datos personales y elige la forma de entrega.' },
    { text: 'Realiza el pago y envíanos el comprobante para confirmar tu pedido.' },
  ],
  deliveryOptions: [
    { text: 'Pago por transferencia o contra entrega en Barranquilla y Soledad.' },
    { text: 'Envíos nacionales.' },
  ],
  exchangePolicies: [
    { text: 'Cambios solo si es error de la marca.' },
    { text: 'Notifícanos al instante, apenas revises tu prenda.' },
    { text: 'La prenda no debe haber sido usada, lavada, dañada ni cambiada previamente por gusto.' },
    { text: 'No hacemos devolución de dinero.' },
  ],
}
