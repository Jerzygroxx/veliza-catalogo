import type { Field, GlobalConfig } from 'payload'
import { anyone, authenticated } from '../access'
import { revalidateGlobalAfterChange } from '../hooks/revalidate'
import { CACHE_TAGS } from '../lib/cache-tags'
import { normalizePhone, validateHttpsUrl, validateWhatsAppNumber } from '../lib/validators'

const textList = (name: string, label: string, singular: string, plural: string): Field => ({
  name,
  type: 'array',
  label,
  labels: { singular, plural },
  fields: [{ name: 'text', type: 'text', required: true, label: 'Texto' }],
})

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Configuración del sitio',
  access: { read: anyone, update: authenticated },
  hooks: { afterChange: [revalidateGlobalAfterChange([CACHE_TAGS.siteSettings])] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Contacto',
          fields: [
            {
              name: 'whatsappNumber',
              type: 'text',
              required: true,
              label: 'Número de WhatsApp',
              defaultValue: '573189952081',
              validate: validateWhatsAppNumber,
              hooks: {
                beforeValidate: [({ value }) => (typeof value === 'string' ? normalizePhone(value) : value)],
              },
              admin: {
                description: 'Con indicativo de país. Puedes escribir +57 318 995 2081; se guarda solo con números.',
              },
            },
            { name: 'instagramUrl', type: 'text', label: 'Instagram (enlace)', validate: validateHttpsUrl },
            { name: 'tiktokUrl', type: 'text', label: 'TikTok (enlace)', validate: validateHttpsUrl },
          ],
        },
        {
          label: 'Avisos',
          fields: [
            {
              name: 'priceNotice',
              type: 'text',
              label: 'Aviso de precios',
              defaultValue: 'Los precios varían por temporada, no manejamos precios fijos.',
            },
            {
              name: 'antifraudNotice',
              type: 'text',
              label: 'Aviso antifraude',
              defaultValue: 'Solo recibimos pedidos por nuestro WhatsApp oficial 💕',
            },
          ],
        },
        {
          label: 'Quiénes somos',
          fields: [
            { name: 'aboutShort', type: 'textarea', label: 'Resumen para el inicio' },
            {
              name: 'aboutStory',
              type: 'textarea',
              label: 'Nuestra historia',
              admin: { description: 'Separa los párrafos con una línea en blanco.' },
            },
            { name: 'mission', type: 'textarea', label: 'Misión' },
            { name: 'vision', type: 'textarea', label: 'Visión' },
          ],
        },
        {
          label: 'Cómo comprar',
          fields: [
            textList('howToBuySteps', 'Pasos para comprar', 'Paso', 'Pasos'),
            textList('deliveryOptions', 'Formas de entrega', 'Opción', 'Opciones'),
            textList('exchangePolicies', 'Políticas de cambio', 'Política', 'Políticas'),
          ],
        },
      ],
    },
  ],
}
