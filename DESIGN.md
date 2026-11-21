---
name: AROMA
description: Vitrina contemporánea de las productoras de La Macarena, donde la fotografía real, el origen y la identidad de cada organización llevan el recorrido.
colors:
  background: "oklch(0.982 0.002 106)"
  card: "oklch(1 0 0)"
  foreground: "oklch(0.19 0.008 150)"
  primary: "oklch(0.47 0.13 135.4)"
  primary-foreground: "oklch(1 0 0)"
  muted: "oklch(0.955 0.004 106)"
  muted-foreground: "oklch(0.43 0.01 140)"
  border: "oklch(0.885 0.005 106)"
  input: "oklch(0.55 0.01 120)"
  accent-line: "oklch(0.619 0.196 38)"
  board: "oklch(0.308 0.122 30.3)"
  board-foreground: "oklch(0.97 0.012 60)"
typography:
  display:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.75rem–4.75rem"
    fontWeight: 800
    lineHeight: 0.88
    fontVariation: '"wdth" 68'
  headline:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2rem–3.5rem"
    fontWeight: 800
    lineHeight: 0.95
    fontVariation: '"wdth" 68'
  figure:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.75rem–4.5rem"
    fontWeight: 800
    lineHeight: 1
    fontFeature: '"tnum"'
    fontVariation: '"wdth" 68'
  editorial-headline:
    fontFamily: "Source Serif 4, ui-serif, Georgia, serif"
    fontSize: "2.25rem–3.5rem"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Source Serif 4, ui-serif, Georgia, serif"
    fontSize: "1.25rem–2.75rem"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.02em"
  lead:
    fontFamily: "Source Serif 4, ui-serif, Georgia, serif"
    fontSize: "1rem–1.25rem"
    fontWeight: 400
    lineHeight: 1.625
  origin:
    fontFamily: "Source Serif 4, ui-serif, Georgia, serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.375
  body:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem–1.125rem"
    fontWeight: 400
    lineHeight: 1.625
    fontFeature: '"tnum"'
  label:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem–0.9375rem"
    fontWeight: 600
    lineHeight: 1.25
rounded:
  none: "0"
  button: "0.3rem"
  pill: "9999px"
spacing:
  gutter-mobile: "1.25rem"
  gutter-tablet: "2rem"
  gutter-desktop: "2.5rem"
  container: "72rem"
  control-height: "2.75rem"
  cta-height: "3rem"
  section-mobile: "3rem"
  section-desktop: "5rem"
  rail-card: "21rem"
  header-height: "5.0625rem"
  header-compact: "4rem"
  featured-card: "23.75rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.button}"
    padding: "12px 24px"
    height: "{spacing.cta-height}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.button}"
    padding: "12px 24px"
    height: "{spacing.cta-height}"
  category-chip:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "{spacing.control-height}"
  category-chip-active:
    backgroundColor: "{colors.foreground}"
    textColor: "{colors.background}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "{spacing.control-height}"
  featured-card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.none}"
    padding: "20px 24px"
    width: "{spacing.featured-card}"
  product-card:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.none}"
    padding: "16px 0 0"
  producer-card:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.none}"
    width: "{spacing.rail-card}"
  alliance-band:
    backgroundColor: "{colors.board}"
    textColor: "{colors.board-foreground}"
    rounded: "{rounded.none}"
    padding: "80px 40px"
  site-header:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.none}"
    height: "{spacing.header-height}"
---

# Design System: AROMA

> **Dos mundos en este repositorio.** El sitio público (todo lo que vive bajo `src/app/(public)`, envuelto en la clase `.plaza`) usa el mundo **«Vitrina de productoras»**, que es el que describen los tokens del encabezado. La administración (`/admin`), la página 404 y el acceso con Clerk siguen en el mundo anterior, **«etiqueta de origen»**, con los tokens de `:root`, hasta que se rediseñen. Cada sección marca qué parte corresponde a cada mundo.

## Overview

**Creative North Star: "La vitrina de productoras"**

Una vitrina colombiana contemporánea: cada producto llega con su foto real, la organización que lo produce (logo, nombre, lugar) y sus precios de referencia, y recorrer productoras se siente como pasar de un puesto a otro de una plaza por composición y fotografía, no por letreros. El suelo es casi blanco y neutro, los paneles son blancos y la tinta casi negra; las regiones grandes son fotografía de producto y de territorio, y esa fotografía pone casi todo el color.

El tono es comercial y enérgico como un e-commerce pulido, pero claramente no transaccional: no hay carrito ni pago, la acción es una conversación por WhatsApp. El refinamiento viene del contraste tipográfico entre tres voces: Archivo condensada y negrísima en mayúsculas solo para el titular grande, los rótulos cortos de sección y las cifras; Source Serif 4 para los nombres de productos y organizaciones, el lugar en cursiva y los textos de entrada; Archivo a ancho normal para la interfaz. La paleta de AROMA aparece con selección: verde para la acción, naranja como una línea fina de estado activo y vino tinto solo en la banda de la alianza.

La densidad es de vitrina: pocas piezas grandes antes que muchas pequeñas, y el recorrido completo (producto, quién lo produce y dónde, precios, WhatsApp) cabe en la primera pantalla. El primer bloque recorre las productoras de a una: un producto destacado por organización.

**Key Characteristics:**

- La fotografía real ocupa las regiones grandes; el color de la página sale de ella.
- Tres voces tipográficas: condensada en mayúsculas para titular, rótulos cortos y cifras; serif para nombres, lugar y entradas; grotesca normal para interfaz.
- Paleta AROMA selectiva: verde = acción, naranja = línea activa de 2 px, vino tinto = banda de la alianza.
- El origen (lugar, en serif cursiva) acompaña siempre al nombre de la organización.
- Casi plano, de esquinas rectas en fotos y paneles; píldoras solo en los filtros de categoría y círculos en las flechas.

## Colors

Neutros casi blancos y tinta, con tres colores de marca usados cada uno para un solo trabajo. Los valores canónicos son OKLCH (los del encabezado); los hexadecimales del sidecar son aproximaciones.

### Primary

- **Verde de acción AROMA** (`primary`, también `ring`): el botón principal de WhatsApp («Consultar por WhatsApp», «Escribir a la Alianza AROMA» de compras por volumen), el pin de la franja de utilidades, los enlaces de texto («Ver ficha completa», «Más productos (N)»), el subrayado al pasar sobre nombres de producto y organización, el hover de los enlaces del pie y el contorno de foco. Texto blanco encima (`primary-foreground`). Es un verde algo más oscuro que el `primary` del admin, para que el texto blanco tenga contraste holgado.

### Secondary

- **Naranja AROMA** (`accent-line`, el `--brand-orange` global): solo como línea de 2 px que marca el enlace actual de la cabecera (regla interior abajo). Nunca texto, relleno ni botón.

### Tertiary

- **Vino tinto AROMA** (`board`, el `--brand-burgundy` global): el fondo de la banda de la alianza (`#alianza`) y nada más. Sobre él, **Crema de banda** (`board-foreground`) con opacidades del 90 % (descripción), 80 % (pie de foto, nombres de organizaciones), 60 % (regla de la cifra) y 20 % (reglas entre filas).

### Neutral

- **Suelo casi blanco** (`background`): fondo de la página, del catálogo y de compras por volumen; las tarjetas de producto y de productora se apoyan directo sobre él, sin panel.
- **Panel blanco** (`card`): barra de la cabecera, tarjeta del destacado, pie, «Así se compra», chips de categoría inactivos y la baldosa del logo.
- **Niebla** (`muted`, `secondary`, `accent`): fondo de una foto mientras carga o cuando falta.
- **Tinta** (`foreground`): texto, chip de categoría activo, texto y borde (al 30 %) de las flechas de la franja, regla de 3 px sobre los pasos de compra, regla de 1 px que abre el tablero de precios y selección de texto (tinta con letra del suelo).
- **Tinta gastada** (`muted-foreground`): franja de utilidades, categoría (y, al 50 %, el punto medio que la separa del lugar), notas bajo el botón, descripciones cortas, enlaces de navegación inactivos y la presentación del h1 solo cuando no hay producto destacado (respaldo sin foto).
- **Velo de foto** (negro sobre la foto): en celular, lineal de abajo hacia arriba (90 % al pie, 65 % a la mitad, transparente arriba); desde 1024 px, radial desde la esquina inferior izquierda (90 %, 68 % al 40 %, 25 % al 72 %, transparente). Sostiene el h1 y los controles en blanco y la presentación en blanco al 90 %; es el único degradado de la vitrina.
- **Junta** (`border`): la línea de 1 px bajo la franja de utilidades y bajo la barra en reposo, el borde fino del pie, filas de precios, la regla sobre el pie de precio de las tarjetas, el borde del botón secundario y el de chips y baldosas de logo.
- **Borde de campo** (`input`): contorno de controles de formulario.

### Named Rules

**The One Job Per Brand Color Rule.** Verde solo para acciones y enlaces; naranja solo como la línea activa de 2 px; vino tinto solo como fondo de la banda de la alianza. Si un color de marca aparece en otro papel, sobra.

**The Photograph Carries Color Rule.** Las superficies son neutras para que la fotografía de producto y territorio ponga el color. No se pintan secciones, tarjetas ni fondos de color para dar energía.

### Mundo anterior (admin, 404, acceso)

La administración conserva los tokens de `:root` de la «etiqueta de origen»: papel `#F6F1E7` de fondo, tarjeta hueso `#FFFDF8`, arena `#ECE4D5`, tinta `#1D1915`, verde acción `#3F7518` (`primary`, texto blanco a 5,6:1), verde marca `#4B8C1C` (solo superficies e ilustración), bordó `#5F0400` (superficie institucional, nunca títulos; también la selección de texto fuera de `.plaza`) y naranja `#E24C11` (acento escaso, nunca texto pequeño). El modo claro es la superficie validada; los tokens oscuros heredados no están certificados.

## Typography

**Display Font:** Archivo variable con eje `wdth` (`--font-archivo` vía `next/font`), condensada al 68 % y peso 800 con la utilidad `font-sign`.
**Editorial Font:** Source Serif 4 variable con tamaño óptico (`--font-source-serif` vía `next/font`), con la utilidad `font-editorial`.
**Body Font:** Archivo a ancho normal; `.plaza` la fija como familia base, con cifras tabulares.

**Character:** El contraste es la idea: una grotesca condensada y pesada que grita poco y en mayúsculas, frente a una serif editorial de lectura tranquila que da nombre a las cosas, sobre una grotesca neutra que hace el trabajo de interfaz. Sin monoespaciada en la vitrina.

### Hierarchy

- **Display** (Archivo condensada 800, 0.88, mayúsculas, `text-balance`): solo el h1 editable de la entrada. Sobre la foto del carrusel, en blanco: 2.75rem → 4rem (640 px) → 4.75rem (1024 px). En el respaldo sin producto, en tinta: 2.75rem → 4.5rem → 4.75rem.
- **Headline** (Archivo condensada 800, 2rem → 3.5rem, 0.92–1, mayúsculas): rótulos de sección cortos: «Productoras» (2rem → 2.5rem), «Explora los productos» (2.5rem → 3.25rem), «Así se compra» (2.5rem → 3.5rem).
- **Figure** (Archivo condensada 800, cifras tabulares): precios del tablero (2rem → 2.25rem), pie de las tarjetas de producto («$ 25.000» o «A consultar», 1.75rem), números de los pasos de compra (3.5rem → 4.5rem, 0.8) y la línea de la alianza «296 mujeres y 8 hombres en 10 organizaciones» (1.75rem → 2.25rem, 0.95, mayúsculas).
- **Editorial headline** (Source Serif 600, 2.25rem → 3.5rem, 1.02–1.05, −0.02em, `text-balance`): títulos que son frases largas: el de la alianza y «¿Compras para tu negocio u organización?».
- **Title** (Source Serif 600): nombre del producto destacado (2.125rem → 2.75rem; 2.25rem en la tarjeta flotante; 1.02, −0.02em), nombre en tarjeta (1.625rem, 1.1, −0.01em), nombre de productora en la franja (1.25rem), nombre de la organización en el destacado (1.125rem), pasos de compra (1.25rem).
- **Lead** (Source Serif 400, 1rem → 1.25rem, 1.625): presentación bajo el h1 sobre la foto del carrusel (1rem → 1.125rem, blanco al 90 %, máx. 42ch; en el respaldo sin producto, junto al h1 en tinta gastada, máx. 48ch), descripción de la alianza (máx. 60ch), descripción corta del destacado, mensaje de catálogo vacío.
- **Origin** (Source Serif 400 cursiva, 1rem): el lugar de la organización junto a su nombre; también el pie de la foto del territorio.
- **Body** (Archivo 400, 1rem → 1.125rem, 1.625): pasos, notas, descripciones cortas en tarjetas (dos líneas), texto de compras por volumen.
- **Label** (Archivo 500–700, 0.8125rem → 0.9375rem): categoría, presentaciones, nombre de la organización en tarjetas, chips, navegación, siglas de la alianza (700, +0.04em).

### Named Rules

**The Short Label Rule.** La condensada en mayúsculas es solo para el h1, para rótulos de sección de una a tres palabras y para cifras. Un título que es una frase, y todo nombre de producto u organización, va en Source Serif.

**The Origin Beside the Name Rule.** Donde aparece una organización como productora (tarjeta del destacado, franja, tarjetas), su lugar va al lado en Source Serif cursiva. El origen es parte de la identidad, no un dato al pie.

**The Loudest Figure Rule.** En la tarjeta del destacado, los precios son las cifras más fuertes después del nombre del producto; tamaño y número de presentaciones nunca compiten con ellos.

**The No Kicker Rule.** No hay antetítulo sobre los títulos. La categoría va debajo del nombre del producto, en tinta gastada.

### Mundo anterior (admin, 404, acceso)

Bricolage Grotesque (variable con tamaño óptico) para h1, títulos de sección, nombres y cifras; Geist para interfaz y texto corrido; Geist Mono en mayúsculas espaciadas para datos de origen, categorías, antetítulos y estados. Los campos de formulario usan 16 px.

## Layout

- `Container` limita el contenido a 72rem (1152 px) con márgenes laterales de 20, 32 y 40 px. Las secciones usan 48 px de padding vertical en móvil y 64–80 px en escritorio.
- Se diseña desde 360–390 px, sin desplazamiento horizontal de página. Las franjas horizontales se desplazan dentro de sí mismas, sin barra nativa: los chips de categoría con `rail-scroll` (snap de proximidad) y las productoras con su propio carrusel (snap obligatorio).
- **Cabecera:** desde 768 px, una franja de utilidades de 40 px (pin verde y «La Macarena · Meta · Colombia» en tinta gastada) que se va con el desplazamiento; debajo, la barra principal pegada arriba (`sticky`): 81 px en reposo desde 768 px (64 px en celular), en una rejilla `1fr auto 1fr` con el logo a la izquierda, la navegación centrada y, desde 1024 px, «Contactar a la alianza» a la derecha. Al desplazarse la barra se compacta a 64 px. El documento compensa con `scroll-padding-top` de 64 px.
- **Orden de la entrada:** carrusel de destacados (`#inicio`); franja «Productoras» (solo con dos o más organizaciones con productos); catálogo «Explora los productos» con chips; «Así se compra»; banda de la alianza (`#alianza`); compras por volumen; pie. Sin ningún producto publicado, el h1 y su presentación van solos en una banda (8 + 4 columnas) como respaldo.
- **Carrusel de destacados, escritorio:** la foto ocupa todo el ancho de la pantalla, con alto `min(100svh − 7.625rem, 42rem)`. El h1, su presentación y los controles del carrusel se apoyan abajo a la izquierda, en la columna de contenido. La tarjeta blanca del producto (23.75rem) flota a la derecha, centrada en vertical y al ras del borde derecho de la columna de contenido; si no cabe, se desplaza por dentro.
- **Carrusel de destacados, celular:** foto 4:3 (16:10 desde 640 px) con el h1, la presentación y los controles encima, sobre el velo; la tarjeta a todo el ancho debajo.
- **Franja de productoras:** una fila de cabecera centrada en vertical con «Productoras», la frase de entrada (desde 640 px) y, desde 1024 px, las flechas, todo en la misma línea media. En escritorio la franja se recorta en la columna de contenido y muestra tres tarjetas y media; en celular y tableta corre hasta los bordes de la pantalla (18.5rem, 21rem desde 768 px). Separación de 20 px; cada tarjeta se detiene en el borde izquierdo de la columna (`scroll-snap` obligatorio). Las organizaciones van en orden alfabético por su nombre corto.
- **Ritmo entre productoras y catálogo:** la franja cierra con 16 px (24 px desde 768 px) y el catálogo abre con 32 px (40 px), para que las dos se lean como un mismo recorrido.
- **Catálogo:** una columna en móvil, dos desde 640 px, tres desde 1024 px; 24 px entre columnas y 48 px entre filas. Cada tarjeta ocupa seis filas de la rejilla con `grid-template-rows: subgrid`, de modo que las tarjetas de una misma fila comparten las alturas de foto, organización, nombre, lugar, descripción y pie.
- **Banda de la alianza:** foto del territorio en 5 columnas y texto en 7; debajo, a todo el ancho, la lista de organizaciones en dos columnas desde 640 px.
- Los chips de categoría son enlaces `?categoria=` que funcionan sin JavaScript. El carrusel de destacados y las flechas de la franja necesitan JavaScript; sin él se ve el primer destacado y la franja se desplaza a mano.

### Named Rules

**The One Block Rule.** El primer bloque es una sola composición: el título de la página va sobre la foto del producto y el producto va en la tarjeta que flota sobre la misma foto. Nunca una banda de título introductorio encima de un bloque «destacado» aparte.

**The First Viewport Rule.** «Consultar por WhatsApp» del producto destacado queda dentro de la primera pantalla a 1440×900, 1366×768 y 390×844. Lo que se agregue a la cabecera o por encima del tablero de precios se mide contra esto.

**The Still Page Rule.** Que la cabecera se compacte nunca mueve la página: la ranura `sticky` reserva siempre la altura de la barra en reposo, y el cambio tiene histéresis (compacta al pasar 80 px, se expande solo por encima de 20 px), observada con dos centinelas y `IntersectionObserver` en lugar de escuchar cada desplazamiento.

**The Column Edge Rule.** En escritorio todo se alinea con la columna de contenido: el h1 sobre la foto, la tarjeta del destacado a la derecha y el recorte de la franja de productoras. Solo la foto del primer bloque va de borde a borde. En celular la franja sí sangra hasta los bordes para mostrar que se desplaza.

**The One Appearance Rule.** Un producto no se repite seguido: el primer destacado sale de la cuadrícula salvo que haya una categoría elegida. Si es el único producto, el catálogo lo dice en una frase en lugar de mostrar una cuadrícula vacía.

**The Level Rows Rule.** En el catálogo, las líneas de una fila de tarjetas quedan a la misma altura: si un nombre ocupa dos líneas, las vecinas reservan ese espacio, y el pie de precio siempre está al fondo.

**The Level Columns Rule.** En la banda de la alianza, la columna de texto termina a la misma altura que la foto: la cifra de la alianza se empuja al pie de su columna.

### Mundo anterior (admin)

Los mismos `Container` y ritmos de sección. En el admin, el contexto de la asociación va en el antetítulo; títulos y textos usan «tu asociación» o «Tus productos» en lugar de repetir su nombre.

## Elevation & Depth

La vitrina es casi plana: sin desenfoques ni texturas. La profundidad viene del contraste entre fotografía, panel blanco y suelo casi blanco, y de reglas finas. Hay tres sombras, cada una para una capa real, y un solo degradado: el velo que sostiene el h1 sobre la foto.

### Shadow Vocabulary

- **Tarjeta sobre la foto** (`box-shadow: 0 18px 48px oklch(0 0 0 / 0.22)`): la tarjeta del producto destacado, desde 1024 px, que flota sobre la foto.
- **Barra compacta** (`box-shadow: 0 6px 24px oklch(0 0 0 / 0.08)`): la barra de la cabecera cuando la página se desplazó; en reposo tiene en su lugar una línea de 1 px en `border`.
- **Logo sobre foto** (`box-shadow: 0 2px 10px oklch(0 0 0 / 0.2)`): el logo de la organización encima de su foto en la franja de productoras.

### Motion

- **Cambio de destacado** (700 ms, ease-out): las fotos se funden una sobre otra; la nueva tarjeta entra con `hero-card-in` (420 ms, `cubic-bezier(0.16, 1, 0.3, 1)`, de transparente y 0,5rem más abajo a su lugar). Sin reproducción automática; se carga por adelantado la foto siguiente.
- **Compactar la cabecera** (200 ms, ease-out): el alto de la barra (81 → 64 px), el ancho del logo (144 → 128 px) y el cambio de la línea por la sombra.
- **Franja de productoras**: cada flecha desplaza una tarjeta completa con desplazamiento suave.
- **Fotos**: al pasar el cursor se acercan un 3 % en tarjetas de producto y un 4 % en tarjetas de productora (500 ms, ease-out).
- **Línea de productora**: al pasar el cursor aparece la línea de 3 px en `border` bajo la foto.
- Con movimiento reducido todo cambia sin transición y el desplazamiento de la franja es inmediato.

### Named Rules

**The Real Layer Rule.** Solo tiene sombra lo que de verdad está encima de otra cosa: la tarjeta sobre la foto, la barra sobre la página y el logo sobre su foto, además de menús y diálogos. El mundo anterior no usa sombras salvo en el menú móvil del admin.

## Shapes

- Esquinas rectas en fotos, tarjeta del destacado, tarjetas, tableros y la banda de la alianza.
- Los logos de organización son círculos (baldosa blanca con borde fino, logo contenido con 8 px de aire). En la entrada solo aparecen si la organización tiene logo propio: sin logo, el nombre va solo, sin círculo ni símbolo de reemplazo.
- Los chips de categoría son píldoras; las flechas de los carruseles son círculos de 44 px con borde fino. Son las únicas formas redondeadas propias de la vitrina.
- Los botones (el primitivo `Button` compartido con el admin) conservan su radio de 0,3rem.
- Reglas como estructura, finas por defecto: 1 px bajo la barra de la cabecera en reposo (al desplazarse la reemplaza la sombra) y bajo la franja de utilidades, sobre el pie, entre filas de precios y sobre el pie de las tarjetas de producto; 1 px en tinta abriendo el tablero de precios; 3 px en tinta solo sobre los pasos de compra; la línea activa naranja de 2 px.
- Áreas táctiles de al menos 44 px; CTA de 48 px.

## Components

### Buttons

- **Shape:** radio de 0,3rem.
- **Dos estilos de WhatsApp y ningún otro** (`WhatsAppButton`, con el logo de WhatsApp y «(se abre en una nueva pestaña)» para lectores de pantalla):
  - **Principal:** verde de acción con texto blanco; hover a 90 % de opacidad. Es la acción del producto: «Consultar por WhatsApp» en la tarjeta del destacado (a todo el ancho de la tarjeta, 48 px) y en la ficha de producto (a todo el ancho en móvil). También «Escribir a la Alianza AROMA» en compras por volumen.
  - **Secundario:** fondo transparente, borde en `border` y texto en tinta. Para toda otra conversación: «Contactar a la alianza» en la cabecera y «Escribir por WhatsApp» en el perfil de una asociación.
- **Destino del botón de producto:** si la asociación tiene WhatsApp, a ella, con un mensaje sobre el producto y su enlace. Si no, el mismo botón con el mismo texto lleva a la alianza: «Hola, Alianza AROMA. Me interesa «producto» de asociación…». Si tampoco la alianza tiene número, no hay botón y queda la explicación.
- **Notas:** el botón de producto va solo, sin explicar qué pasa al tocarlo. La única nota es la de la ficha cuando la asociación no tiene número, porque el destino cambia: «… aún no tiene un WhatsApp publicado. La Alianza AROMA puede ponerte en contacto con la asociación.». En la tarjeta del destacado ni esa nota.
- **Focus:** contorno de 2 px en verde de acción con 4 px de separación (en la banda de la alianza y sobre la foto, en blanco o crema).

### Chips (CategoryFilter)

- **Style:** píldoras de 44 px de alto, 16 px de padding, etiqueta seminegrita de 0,9375rem, panel blanco con borde fino; hover oscurece el borde a tinta.
- **State:** el activo es tinta llena con letra del suelo y `aria-current="page"`. «Todos» primero. Enlaces `?categoria=` sin JavaScript; en móvil, franja desplazable que sangra hasta los bordes.

### Carrusel de destacados (HeroCarousel + FeaturedCard, signature)

`section#inicio` con `aria-roledescription="carrusel"`: un producto destacado por organización (el último que publicó cada una, empezando por la que publicó más reciente). La foto del producto ocupa el fondo, con el velo oscuro abajo a la izquierda; sobre él, el h1 editable (bloque `home_hero`) en condensada blanca, su presentación en serif y los controles: flecha anterior, contador «1 / 5» y flecha siguiente (círculos de 44 px con borde blanco al 45 % sobre negro al 20 %). También se cambia con las flechas del teclado y, en pantallas táctiles, deslizando de lado. Cada cambio se anuncia a lectores de pantalla («Destacado 2 de 5: …»). La foto es la «Foto para el inicio» del producto (horizontal, opcional, se sube desde el admin) y, si no la tiene, su foto principal recortada al carrusel. Sin ninguna foto, el símbolo de AROMA y «Foto en camino» sobre niebla.

La tarjeta (`FeaturedCard`, en panel blanco), de arriba abajo: logo circular de 48 px si existe, con el nombre de la organización (serif, enlace al perfil) y su lugar en cursiva; nombre del producto en serif a escala de titular (enlace a la ficha); categoría, número de presentaciones y «Precios de referencia»; tablero de precios (regla de tinta arriba, hasta cuatro filas con presentación a la izquierda y precio en cifra condensada a la derecha, sin repetir el tamaño si el nombre ya lo dice; «Consultar» si no hay precio; «Ver todas las presentaciones (N)» si hay más); «Consultar por WhatsApp» a todo el ancho; la descripción corta en serif (se oculta en pantallas bajas o si el tablero se recortó); y, bajo una regla, los enlaces en verde «Ver ficha completa» y «Más productos (N)».

### Franja de productoras (ProducerRail + ProducerCarousel, signature)

`nav` con el rótulo «Productoras», la frase «Conoce a cada organización y todo lo que produce.» (desde 640 px) y, desde 1024 px, las flechas «Productoras anteriores» y «Productoras siguientes» (círculos de 44 px con borde en tinta al 30 %). Cada clic avanza una tarjeta completa; la flecha de un extremo se atenúa al 30 % y no hace nada, pero sigue enfocable. En celular no hay flechas: se desliza. Una tarjeta por organización con productos, enfocable con teclado y con contorno de foco visible: foto 4:3 (la portada de la organización o, sin portada, el símbolo de AROMA y «Foto en camino»), el logo de 64 px abajo a la izquierda solo si existe, la línea de 3 px que aparece al pasar el cursor, el nombre corto en serif (`getProducerLabel` quita «Asociación de», «Colectivo de», «Fundación»…; el nombre completo queda para lectores de pantalla), el lugar en cursiva y el número de productos. Cada tarjeta abre el perfil de la organización.

### Tarjeta de producto (PlazaProductCard)

- **Corner Style:** recta, sin panel: la tarjeta se apoya sobre el suelo.
- **Contenido (seis filas de subgrid):** foto 4:5; logo de 24 px si existe, con el nombre de la organización; nombre del producto en serif; lugar en cursiva y categoría, separados por un punto medio en tinta gastada al 50 %; descripción corta en dos líneas; y el pie, al fondo bajo una regla fina, con una etiqueta pequeña a la izquierda y el valor en cifra condensada a la derecha: «Desde» + «$ 25.000» o, sin precio, «Precio» + «A consultar». Las dos variantes tienen la misma altura.
- **Sin botón:** la tarjeta lleva a la ficha, donde está «Consultar por WhatsApp».
- **Interacción:** el enlace es el nombre y cubre toda la tarjeta; hover subraya el nombre en verde y acerca la foto; el foco dibuja el contorno alrededor de la tarjeta.

### Así se compra (HowToBuy)

Banda blanca entre reglas finas: rótulo condensado, regla de 3 px en tinta y tres pasos con número condensado gigante, título en serif y texto; separados por reglas verticales en escritorio.

### Banda de la alianza (AllianceBoard)

Sección `#alianza` en vino tinto con letra crema. Foto del río Guayabero a su proporción nativa 4:5 (fuente de 576×720) con el sello superpuesto en la esquina inferior derecha y su pie en serif cursiva; título y descripción editables (bloque `home_alliance`) en serif; la cifra de la alianza en condensada sobre una regla al 60 %, al pie de la columna; debajo, la lista de organizaciones (sigla en negrita espaciada, conteo y nombre completo en serif, este solo visible desde 640 px) y «Conoce las asociaciones» subrayado en crema. Los datos viven en `src/content/home.ts`.

### Compras por volumen (BulkContact)

Cierre sobre el suelo: pregunta en serif, una frase y «Escribir a la Alianza AROMA» con el estilo principal. Se oculta si la alianza no tiene número.

### Navigation

- **Cabecera:** franja de utilidades (desde 768 px) y barra principal blanca pegada arriba, con línea de 1 px en reposo. Logo horizontal (112 px; 128 px desde 640 px; 144 px desde 768 px, que vuelve a 128 px al compactarse; símbolo bajo 480 px), «Productos», «Asociaciones» y «La alianza» centrados, y «Contactar a la alianza» (secundario) a la derecha desde 1024 px. Al desplazarse, la barra se compacta a 64 px y cambia la línea por una sombra suave (ver The Still Page Rule).
- **Estados:** inactivo en tinta gastada seminegrita; hover en tinta; activo en tinta con la línea naranja interior de 2 px abajo y `aria-current`. «La alianza» se activa mientras su sección ocupa el centro de la pantalla.
- **Pie:** panel blanco con borde fino arriba, logo, texto del bloque `footer_about`, la misma navegación (hover en verde) y «Acceso administrativo».

### Marca

SVG oficiales en `public/brand`, servidos sin optimizar mediante `AromaLogo`, sin el contorno negro fino de los originales de impresión. `horizontal` en cabecera, pie y admin; `descriptor` solo a 220 px o más; `symbol` en la cabecera bajo 480 px, fotos ausentes, logos ausentes y la 404; `aroma-sello.svg` una vez por pantalla y a 112 px o más (hoy, en la banda de la alianza).

### Ficha de producto (`/productos/[asociación]/[producto]`)

Conserva su estructura de siempre y habla el idioma de la vitrina. Miga de pan en etiqueta seminegrita («← Productos / Categoría»). Arriba, dos columnas: la galería (`ProductGallery`: en escritorio, una foto grande 4:5 del ancho de la columna (comparte bordes con la «Etiqueta de origen») y, con dos o más, una fila de miniaturas de 72 px debajo, que cambia la foto grande con el fundido de 700 ms del carrusel, marca la actual con un borde de 2 px en tinta y anuncia «Foto N de M»; la galería mide lo mismo tenga 2 u 8 fotos. En celular, franja deslizable con la siguiente foto asomando y «N fotos · desliza para ver más». Esquinas rectas; sin fotos, el símbolo de AROMA y «Foto en camino» sobre niebla) y, a la derecha y fija al desplazarse en escritorio, la ficha en el orden de la tarjeta destacada: logo de 48 px solo si existe, nombre de la organización en serif seminegrita (enlace con subrayado verde) y su lugar en cursiva; el h1 en Source Serif 600 (2.5rem → 3.25rem, −0.02em); categoría y número de presentaciones en etiqueta de tinta gastada (sin antetítulo); la descripción corta en serif de entrada. Debajo, «Presentaciones» (`ProductPresentations`): el tablero de la tarjeta destacada, regla de 1 px en tinta, filas con nombre (y tamaño solo si el nombre no lo dice) y precio en cifra condensada de 2rem → 2.25rem («Consultar» sin precio); luego «Consultar por WhatsApp» (principal, a todo el ancho de la columna, como en la tarjeta destacada), solo salvo la nota cuando la asociación no tiene número, y debajo la nota de precios de referencia si hay algún precio. El botón queda en la primera pantalla en escritorio (1440×900, 1366×768 y 1024×768); en celular se llega bajando, después de la foto. Abajo, la «Etiqueta de origen»: panel blanco abierto por una regla de 3 px en tinta, rótulo condensado y filas de etiqueta pequeña con su valor en serif (el origen en cursiva), más la descripción de la asociación en cinco líneas; a su lado, «Sobre el producto» e «Ingredientes» con títulos y texto en serif. Cierra «Más de {nombre corto}» (título en serif; el nombre completo para lectores de pantalla), bajo una regla fina: hasta tres tarjetas del catálogo (`PlazaProductGrid`, las mismas del inicio) con los otros productos de la misma asociación y, si tiene más, «Ver los N productos» hacia su perfil. Si la asociación no tiene otros productos, la sección no aparece.

### Directorio de asociaciones (`/asociaciones`)

Encabezado: «Asociaciones» en condensada mayúscula (2.75rem → 4.5rem) y, debajo a todo el ancho, la presentación editable (bloque `associations_intro`) en serif de entrada con el conteo «N asociaciones en M zonas de La Macarena». Debajo, el mapa a todo el ancho de la columna de contenido, con el territorio completo del municipio (se prefiere desplazar la página a recortarlo), y después «Todas las asociaciones» en cuadrícula.

- **Mapa del territorio (`TerritoryMap`):** dibujo propio de La Macarena generado desde OpenStreetMap (`scripts/build-territory-map.py` → `src/content/territory-map.ts`): el municipio en panel blanco con contorno de 1.5 px en tinta, los municipios vecinos en niebla con su nombre en etiqueta mayúscula, los parques Tinigua y Sierra de La Macarena con un rayado fino y borde punteado, los ríos Guayabero, Losada y Duda en tinta gastada, anillos punteados de 25, 50 y 100 km en línea recta desde el pueblo (rotulados en la sabana del suroeste, lejos de las zonas; ocultos en celular) y el pueblo como un cuadrado de tinta con «La Macarena» en serif a su derecha. Se dibuja en el servidor; el componente interactivo solo recibe el encuadre y la proyección (`territory-frame.ts`). En celular solo se rotula el pueblo. Es decorativo (`aria-hidden`); lo que ubica lo dicen los marcadores y la lista. Al pie, solo «Zonas aproximadas. Fuentes: CORPOREFUGIO (2025) y © OpenStreetMap».
- **Zonas (`src/content/territory.ts`):** lista fija de veredas y centros poblados de la alianza con su posición aproximada y su distancia al pueblo (fuente: mapa de CORPOREFUGIO, 2025). Cada asociación elige la suya en el admin («Zona en el mapa», opcional); sin zona aparece en la lista pero no en el mapa.
- **Marcadores:** botones circulares en el verde de acción, con borde blanco, sombra de capa y el número de asociaciones de la zona (24 px en celular, 36 px desde 640 px). Si dos marcadores se superpondrían (contando el agrandado del elegido), se apartan lo justo y una línea fina en tinta con un punto los une con su lugar real. Los marcadores sin vecinos cerca llevan el nombre de su zona en serif cursiva a su derecha, o encima cerca del borde derecho (desde 640 px). Pasar el cursor o enfocar uno muestra una vista previa, que espera 200 ms antes de cerrarse para que el cursor la alcance; con una vista previa abierta, cruzar otro marcador no la cambia salvo que el cursor se detenga 150 ms en él. El clic o el toque la deja fija (`aria-expanded`) hasta cerrarla con la X, Escape (el foco vuelve al marcador) o un clic fuera de las tarjetas. El marcador mostrado crece con contorno en tinta.
- **Pila de la zona (`ZoneStack`):** junto a su marcador, abierta hacia el lado con más espacio y dentro del mapa (mientras está abierta puede tapar otros marcadores); en celular, bajo el mapa: nombre de la zona en serif, distancia y, separadas por reglas finas, las asociaciones apiladas con portada pequeña, nombre en serif con enlace, número de productos y «Ver asociación →». Pasar el cursor a la vista previa la mantiene abierta para alcanzar sus enlaces.
- **«Todas las asociaciones»:** rótulo condensado y cuadrícula de 1, 2 y 3 columnas con tarjetas como las de la franja de productoras: portada 4:3 (o el símbolo y «Foto en camino») con el logo circular encima solo si existe, la línea de 3 px (en tinta mientras su zona está mostrada en el mapa), nombre en serif con enlace a toda la tarjeta, zona en cursiva con su distancia (o, sin zona, la ubicación), descripción en dos líneas y «N productos» o «Aún sin productos publicados». Están todas, también las que no tienen zona. Sin la «A» gris.

### Páginas públicas en transición

El perfil de asociación (`/asociaciones/[asociación]`) está dentro de `.plaza`: toma el suelo casi blanco, el panel blanco, el texto en Archivo y el verde de acción de la vitrina como `primary` y foco. Pero todavía usa los componentes del mundo anterior: títulos en Bricolage Grotesque, datos y antetítulos en Geist Mono, `SectionHeading` y `ProductCard` (en «Sus productos»). Su logo todavía muestra el símbolo de AROMA en gris cuando no hay logo propio. Es un estado provisional hasta su rediseño; no se toma como referencia para pantallas nuevas de la vitrina ni se describe aquí cómo quedará.

### Administración (mundo anterior: «etiqueta de origen»)

Lo que sigue documenta el admin tal como está en el código; rige hasta que se rediseñe. Usa los tokens de `:root`, reglas finas en lugar de cajas, Bricolage en títulos y Geist Mono para datos. shadcn/ui es infraestructura adaptada a esos tokens.

- **AdminPageHeader**: antetítulo opcional (asociación o alianza), título en display y regla en tinta. En páginas internas lo antecede `AdminBackLink` hacia la lista. Su acción principal ocupa el ancho total en móvil, como las acciones de los formularios.
- **Lista administrativa de productos** (`/admin/products`): tabla en escritorio y filas apiladas en móvil, con producto, categoría, asociación cuando aplica, estado y acción. El superadmin ve una sola lista; el admin de asociación ve sus productos y, aparte, los publicados por otras asociaciones activas como «Solo lectura». La visibilidad y el permiso de gestión se calculan en el servidor. Categorías y asociaciones inactivas se señalan con una nota en mono.
- **Gestión de asociaciones** (`/admin/associations`, solo superadmin): tabla en escritorio y filas apiladas en móvil, con nombre, ubicación y «Ver perfil público» si está activa, estado (`ActiveStatusBadge`: «Activa» con círculo verde, «Inactiva» con cuadrado vacío), productos publicados sobre el total y cuentas de administración. «Nueva asociación» pide solo nombre y ubicación; la dirección pública sale del nombre y no cambia. «Editar» abre el editor de perfil. «Desactivar» y «Activar» abren un diálogo que explica el efecto (vitrina, perfil y acceso de sus administradoras) y aclara que no se borra nada. No hay eliminación.
- **Gestión de categorías** (`/admin/categories`, solo superadmin): mismo patrón, con nombre, descripción en dos líneas, «Ver en la vitrina» si tiene productos publicados, estado y uso («3 publicados de 5 productos» o «Sin productos»). La dirección del filtro (`/?categoria=…`) sale del nombre y no cambia al renombrar. Desactivar explica que oculta sus productos sin borrar nada. «Eliminar categoría» solo se habilita si ningún producto la usa; si no, se deshabilita con la razón.
- **Gestión de usuarios** (`/admin/users`, solo superadmin): persona (nombre, correo y «(tú)»), rol, asociación («Toda la alianza» para el superadmin) y estado con forma y texto: círculo verde «Activa», círculo discontinuo «Invitación pendiente», cuadrado vacío «Inactiva». «Nuevo usuario» pide nombre, correo, rol y asociación (solo para el administrador de asociación) y envía una invitación. La edición muestra el correo como dato fijo, el rol (fijo en la propia cuenta), «Invitación» con «Reenviar» y «Cancelar» y «Acceso» con su diálogo; nadie se desactiva a sí mismo.
- **Contenido** (`/admin/content`, solo superadmin): conjunto fijo de bloques definidos en `src/lib/site-content/blocks.ts` (portada del inicio, la alianza en el inicio, presentación de las asociaciones, pie de página y contacto de la alianza). «Contacto de la alianza» es un teléfono validado y normalizado («+57 300 111 2233») que puede quedar vacío para ocultar los botones de contacto con la alianza; mientras nunca se haya guardado rige `ALLIANCE_SUPPORT_WHATSAPP`. La lista muestra cada bloque con nombre, dónde aparece, una cita del texto actual (regla izquierda) y «Editado el … por …» o «Texto original» en mono. La edición tiene límite y ayuda; si el texto cambió, «Texto original» permite restaurarlo con confirmación. La base guarda solo las palabras; la composición sigue en el código.
- **Registro por invitación** (`/admin/sign-up`): el formulario de Clerk solo si llega con la invitación; sin ella, una tarjeta explica que el acceso es solo por invitación.
- **Perfil de asociación en el admin** (`/admin/association` y «Editar» del superadmin): dirección pública y, con `FormSection`, «Información pública» y «Contacto» (WhatsApp normalizado y persona de contacto, que no se publica). Solo el superadmin cambia el nombre. Debajo, «Logo» (baldosa cuadrada) y «Portada» (21:8), cada una con su botón, vista previa reducida en el navegador y «Quitar» con confirmación.
- **ConfirmActionButton**: diálogo genérico con título, explicación y botón de confirmar, rojo para acciones que retiran algo. `ConfirmDeleteButton` lo usa para eliminar.
- **AdminEmptyState**: espacio con borde discontinuo, icono, título breve que no repite el de la sección y texto que explica cuándo aparecerá contenido; admite una acción.
- **StatusBadge**: estado del producto con forma y texto, nunca solo color: círculo verde «Publicado», círculo vacío «Borrador», cuadrado naranja «Pausado».
- **Formulario de producto**: secciones «Información básica» y «Detalles» con título y propósito a la izquierda en escritorio; etiqueta visible, «Opcional» en mono, ayuda con el límite de caracteres y `select` nativo. Validación en servidor: aviso general con `role="alert"`, error bajo cada campo (`aria-invalid`, `aria-describedby`), foco en el primer campo inválido y valores conservados. «Cancelar» y el botón principal al final; en móvil, el principal primero.
- **Contexto de edición**: la asociación en el antetítulo, fija; el estado acompaña al título; el identificador web queda fijo al publicarse; una categoría inactiva se conserva como «(inactiva)»; si está publicado, un aviso con borde naranja advierte que los cambios se verán en la vitrina.
- **Página de producto** (`/admin/products/[id]`): `AdminSection` con **Publicación** (`StatusBadge`, qué ve el público, requisitos con marca verde o equis naranja, la acción disponible con su nota), **Presentaciones** (lista con «Subir», «Bajar» y «Editar», o `AdminEmptyState`) e **Información** (filas con etiqueta mono y «Sin completar»).
- **Formulario de presentación**: nombre, cantidad y unidad, precio en pesos enteros con «$» y «Disponible». «Eliminar presentación» a la izquierda en rojo sin relleno, con confirmación; se deshabilita con la razón si es la única disponible de un producto publicado.
- **Imágenes del producto**: cuadrícula de 2 a 4 columnas a 4:5; la primera es la principal («Principal» en mono); controles para moverlas y editar el texto alternativo; máximo 8. La subida reduce la foto en el navegador y lo dice («Preparando la foto…»).
- **Foto para el inicio** (`/admin/products/[id]`, sección «Foto para el inicio»): opcional, una por producto, horizontal (mejor 16:9, al menos 1600 px de ancho), reducida a 2400 px. Usa el mismo formulario de imagen única que el logo y la portada de la asociación (`ImageFieldForm`): vista previa 16:9 y, debajo, cómo la recorta el carrusel del inicio en computador (15:7) y en celular (4:3), con «Quitar foto» y confirmación. Sin ella, el inicio recorta la foto principal.
- **AdminNotice**: mensaje de una línea con regla izquierda de 3 px: verde para confirmaciones (`role="status"`), naranja para advertencias y rojo para errores (`role="alert"`).
- **Navegación admin**: activo en verde claro con barra verde a la izquierda; pendientes con «Pronto», deshabilitadas. Superadmin: Inicio, Productos, Asociaciones, Categorías, Contenido y Usuarios; administradora de asociación: Inicio, Productos y Mi asociación. Mismo orden en barra lateral y menú móvil.
- **Inicio del panel** (`/admin`): saludo con la asociación o «Alianza AROMA» en el antetítulo y secciones `AdminSection` con cifras enlazadas bajo regla en tinta, borradores con lo que les falta y accesos según el rol. Las cifras se calculan en el servidor; los botones ocupan el ancho en móvil.
- **Estados**: la 404 (fuera de `.plaza`) usa el símbolo, un título en display y una sola acción. Los avisos de acceso al admin explican qué pasó, muestran la cuenta y la asociación afectadas y ofrecen contactar a la alianza por WhatsApp, usar otra cuenta o volver al sitio.
- **Foco**: contorno de 2 px en verde acción con 4 px de separación; en pestañas, contorno interior.

## Do's and Don'ts

### Do:

- **Do** dejar que la fotografía real de producto y territorio ocupe las regiones grandes y ponga el color.
- **Do** usar verde de acción solo para acciones y enlaces, naranja solo como línea activa de 2 px y vino tinto solo para la banda de la alianza.
- **Do** reservar `font-sign` (Archivo al 68 %, peso 800, mayúsculas) para el h1, rótulos de sección cortos y cifras; nombres y títulos-frase en Source Serif 4.
- **Do** poner el lugar de la organización en Source Serif cursiva al lado de su nombre en el destacado, la franja y las tarjetas.
- **Do** usar solo los dos estilos de `WhatsAppButton`: principal para el producto (siempre «Consultar por WhatsApp») y para compras por volumen; secundario para cualquier otra conversación.
- **Do** dar al botón de producto la alianza como destino cuando la asociación no tiene número, con el mismo texto y estilo y un mensaje que nombre producto y asociación.
- **Do** abrir cada tarjeta de productora con su portada o, sin portada, con «Foto en camino».
- **Do** contar el primer bloque como una sola composición: h1, presentación y controles sobre la foto, producto en la tarjeta que flota encima.
- **Do** mantener «Consultar por WhatsApp» del destacado dentro de la primera pantalla a 1440×900, 1366×768 y 390×844.
- **Do** poner el h1 sobre la foto siempre encima del velo oscuro, con contraste de al menos 3:1 incluso con una foto de producto clara.
- **Do** alinear con la columna de contenido el h1, la tarjeta del destacado, la fila de título de las productoras y el recorte de su franja en escritorio.
- **Do** centrar en una misma línea media el rótulo de sección, su frase y sus flechas.
- **Do** reservar la altura de la barra en reposo y usar histéresis al compactarla, para que la página no se mueva ni la barra vibre.
- **Do** compartir filas con subgrid en las tarjetas del catálogo, con el pie de precio al fondo y la misma altura con y sin precio.
- **Do** mostrar la foto del río Guayabero a su proporción nativa 4:5 y a su tamaño, y terminar las dos columnas de la banda de la alianza a la misma altura.
- **Do** sacar el primer destacado de la cuadrícula cuando no hay categoría elegida.
- **Do** acortar el nombre visible de las productoras con `getProducerLabel`, ordenarlas alfabéticamente por ese nombre y dejar el nombre completo para lectores de pantalla.
- **Do** dar nombre accesible a cada flecha, anunciar el cambio de destacado y dejar las tarjetas de la franja enfocables con un contorno visible.
- **Do** respetar movimiento reducido: el contenido está en su lugar desde el primer cuadro.
- **Do** validar teclado, 360–390 px y escritorio, con nombres largos, organizaciones sin logo ni portada, productos sin precio y categorías vacías; mantener el contenido institucional en `src/content` y los bloques editables.

### Don't:

- **Don't** volver a letreros, números ni colores por organización («puestos» literales): el recorrido de productoras sale de la composición, la foto, el origen y la identidad de cada organización.
- **Don't** poner en condensada mayúscula un título largo ni un nombre de producto u organización.
- **Don't** poner antetítulos ni etiquetas sobre los títulos de la vitrina.
- **Don't** usar el naranja como relleno, texto o botón, ni el vino tinto fuera de la banda de la alianza, ni pintar secciones de color para dar energía.
- **Don't** crear un tercer estilo de botón de WhatsApp, ni cambiar el texto del botón de producto según el destino.
- **Don't** mostrar el símbolo gris de AROMA ni un círculo vacío en lugar del logo de una organización en la entrada.
- **Don't** dejar una tarjeta de productora con un bloque gris vacío.
- **Don't** recortar la foto del territorio a 3:2 ni ampliarla a todo el ancho.
- **Don't** usar madera, tiza, letras pintadas ni otra estética rústica, folclórica o artesanal, ni la tienda genérica de tarjetas iguales.
- **Don't** añadir degradados (salvo el velo bajo el h1 sobre la foto), desenfoques ni texturas, ni sombras fuera de las tres capas reales.
- **Don't** separar el título introductorio y el producto destacado en dos bloques.
- **Don't** reproducir el carrusel de destacados automáticamente.
- **Don't** mostrar el mismo producto dos veces seguidas (destacado y cuadrícula).
- **Don't** tomar las páginas públicas en transición ni el admin como referencia para pantallas nuevas de la vitrina.
- **Don't** publicar imágenes generadas como si fueran productos reales, ni sellos como «100 % orgánico» sin certificación.
- **Don't** (admin, mundo anterior) volver a tarjetas con caja para todo, píldoras rellenas ni el bordó en títulos.
