/**
 * Fixed parts of the home page. Its title, presentation and the alliance
 * text are institutional content edited from the admin
 * (`src/lib/site-content/blocks.ts`); the organizations stay here as
 * structured data, not free text.
 */
export const homeContent = {
  hero: {
    eyebrow: "La Macarena · Meta · Colombia",
    image: {
      alt: "Atardecer sobre el río Guayabero, con la selva reflejada en el agua",
      caption: "Río Guayabero, La Macarena",
    },
  },
  alliance: {
    eyebrow: "La alianza",
    organizations: [
      {
        acronym: "ASCAGY",
        name: "Asociación Campesina Agropecuaria Ambiental y Turística Guayabero – Yarumales",
        women: 80,
      },
      {
        acronym: "ASMUCACD",
        name: "Asociación de Mujeres Campesinas Ambientalistas de la Cristalina del Losada por sus Derechos",
        women: 65,
      },
      {
        acronym: "AAMPY",
        name: "Asociación Ambiental de Mujeres Trabajadoras por el Desarrollo del Yarí",
        women: 52,
      },
      {
        acronym: "ASMUJSANJUAN",
        name: "Asociación de Mujeres por el Progreso y Desarrollo de San Juan de Losada",
        women: 32,
      },
      {
        acronym: "ASMUPALMAR",
        name: "Asociación de Mujeres Campesinas de la vereda El Palmar",
        women: 20,
      },
      {
        acronym: "ASOMACARENA",
        name: "Asociación de Mujeres Gestoras de Paz y de los Derechos del Territorio Sierra de La Macarena",
        women: 17,
        men: 8,
      },
      {
        acronym: "Las Guacamayas",
        name: "Colectivo de Mujeres Campesinas de la vereda El Jordán",
        women: 8,
      },
      {
        acronym: "Las Luchadoras",
        name: "Colectivo de Mujeres Firmantes de Paz",
        women: 8,
      },
      {
        acronym: "ASMURA",
        name: "Alianza de Mujeres dentro de los Parques Nacionales Naturales Tinigua y Sierra de La Macarena",
        women: 8,
      },
      {
        acronym: "FUNMAFO",
        name: "Fundación Cultural Memoria, Arte y Folclor",
        women: 6,
      },
    ],
  },
} as const;
