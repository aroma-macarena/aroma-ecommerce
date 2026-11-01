/**
 * The institutional copy AROMA edits from the admin. The set is fixed: each
 * block has a place in the public site, and the application decides how it
 * looks. The database stores only the words; the texts below are the
 * fallback while a block has never been saved.
 *
 * Client-safe: no database code here.
 */

export type SiteContentField = {
  label: string;
  hint: string;
  maxLength: number;
};

export type SiteContentBlock = {
  key: string;
  label: string;
  /** Where the block appears, for administrators. */
  location: string;
  /** A public path to see it in place. */
  href: string;
  title: SiteContentField | null;
  content: SiteContentField & { multiline: boolean };
  fallback: { title: string | null; content: string };
};

export const siteContentBlocks = [
  {
    key: "home_hero",
    label: "Portada del inicio",
    location:
      "Inicio, arriba de todo: el título principal del sitio y su frase de presentación, junto a la foto del territorio.",
    href: "/",
    title: {
      label: "Título",
      hint: "El título más grande del sitio. Corto y directo. Hasta 80 caracteres.",
      maxLength: 80,
    },
    content: {
      label: "Presentación",
      hint: "Una o dos frases bajo el título. Hasta 220 caracteres.",
      maxLength: 220,
      multiline: false,
    },
    fallback: {
      title: "Productos de La Macarena",
      content:
        "Conoce la oferta de las organizaciones y mujeres productoras de la Alianza AROMA.",
    },
  },
  {
    key: "home_alliance",
    label: "La alianza en el inicio",
    location:
      "Inicio, banda vino tinto «La alianza»: el título y el texto que presentan a AROMA, junto a la lista de organizaciones.",
    href: "/#alianza",
    title: {
      label: "Título",
      hint: "Hasta 100 caracteres.",
      maxLength: 100,
    },
    content: {
      label: "Texto",
      hint: "Quiénes son y qué hacen, en un párrafo. Hasta 400 caracteres.",
      maxLength: 400,
      multiline: false,
    },
    fallback: {
      title: "Mujeres con raíces de paz, frutos de vida",
      content:
        "AROMA es la Alianza Rural de Organizaciones de Mujeres Activas del Territorio de La Macarena: organizaciones campesinas que dan a conocer lo que producen y lo acercan a nuevos compradores.",
    },
  },
  {
    key: "associations_intro",
    label: "Presentación de las asociaciones",
    location:
      "Página «Asociaciones», bajo el título: la frase que presenta el directorio.",
    href: "/asociaciones",
    title: null,
    content: {
      label: "Presentación",
      hint: "Una o dos frases. Hasta 260 caracteres.",
      maxLength: 260,
      multiline: false,
    },
    fallback: {
      title: null,
      content:
        "Las organizaciones de mujeres productoras de La Macarena que forman la Alianza AROMA. Conoce quiénes son y qué ofrece cada una.",
    },
  },
  {
    key: "footer_about",
    label: "Pie de página",
    location:
      "Al final de todas las páginas públicas, bajo el logo. Cada línea en blanco separa un párrafo; úsalo, por ejemplo, para agradecer a quienes apoyan la alianza.",
    href: "/",
    title: null,
    content: {
      label: "Texto",
      hint: "Uno o dos párrafos cortos. Hasta 400 caracteres.",
      maxLength: 400,
      multiline: true,
    },
    fallback: {
      title: null,
      content:
        "Productos de las organizaciones de mujeres que forman parte de la Alianza AROMA, en La Macarena, Meta.\n\nCon el apoyo de CORPOREFUGIO.",
    },
  },
] as const satisfies readonly SiteContentBlock[];

export type SiteContentKey = (typeof siteContentBlocks)[number]["key"];

export function getSiteContentBlock(key: string) {
  return siteContentBlocks.find((block) => block.key === key) ?? null;
}

/** Paragraphs of a multiline text, split by blank lines. */
export function toParagraphs(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}
