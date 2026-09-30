import type { Metadata } from 'next'
import React from 'react'
import { SectionTitle } from '../../../../components/store/SectionTitle'
import { getSiteSettings } from '../../../../lib/data'
import { paragraphs } from '../../../../lib/text'

export const metadata: Metadata = { title: 'Quiénes somos' }

export default async function AboutPage() {
  const s = await getSiteSettings()
  const story = paragraphs(s.aboutStory)
  return (
    <div className="mx-auto max-w-2xl px-4 pt-12">
      <SectionTitle script="¿Quiénes somos?">Nuestra historia</SectionTitle>
      <div className="grid gap-4 text-lg">
        {story.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
      {(s.mission || s.vision) && (
        <div className="mt-16 grid gap-10 md:grid-cols-2">
          {s.mission && (
            <section>
              <p className="font-script text-3xl text-roca" aria-hidden="true">
                Misión
              </p>
              <h2 className="font-serif text-2xl">Nuestra misión</h2>
              <p className="mt-2">{s.mission}</p>
            </section>
          )}
          {s.vision && (
            <section>
              <p className="font-script text-3xl text-roca" aria-hidden="true">
                Visión
              </p>
              <h2 className="font-serif text-2xl">Nuestra visión</h2>
              <p className="mt-2">{s.vision}</p>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
