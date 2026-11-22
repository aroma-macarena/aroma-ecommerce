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
  # Admin, «Cuaderno de la asociación» (.cuaderno sobre AdminShell)
  cuaderno-paper: "oklch(0.985 0.004 255)"
  cuaderno-grid-line: "oklch(0.955 0.012 258)"
  cuaderno-ink: "oklch(0.255 0.012 265)"
  cuaderno-primary: "oklch(0.45 0.15 262)"
  cuaderno-accent: "oklch(0.945 0.025 262)"
  cuaderno-accent-foreground: "oklch(0.36 0.15 262)"
  cuaderno-muted: "oklch(0.955 0.012 258)"
  cuaderno-muted-foreground: "oklch(0.47 0.02 262)"
  cuaderno-border: "oklch(0.915 0.016 258)"
  cuaderno-input: "oklch(0.62 0.03 262)"
  correction: "oklch(0.58 0.19 25)"
  cuaderno-destructive: "oklch(0.55 0.19 25)"
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
  admin-title:
    fontFamily: "Atkinson Hyperlegible Next, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.75rem–2rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.015em"
    fontFeature: '"tnum"'
  admin-section:
    fontFamily: "Atkinson Hyperlegible Next, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.4
    fontFeature: '"tnum"'
  admin-figure:
    fontFamily: "Atkinson Hyperlegible Next, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1
    fontFeature: '"tnum"'
  admin-body:
    fontFamily: "Atkinson Hyperlegible Next, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: '"tnum"'
  admin-note:
    fontFamily: "Atkinson Hyperlegible Next, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
    fontFeature: '"tnum"'
  admin-label:
    fontFamily: "Atkinson Hyperlegible Next, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem–0.9375rem"
    fontWeight: 700
    lineHeight: 1.25
    fontFeature: '"tnum"'
rounded:
  none: "0"
  button: "0.3rem"
  pill: "9999px"
  admin-sheet: "0.3rem"
  admin-thumb: "0.225rem"
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
  admin-rail: "15rem"
  admin-topbar: "3.5rem"
  admin-tabbar: "3.5rem"
  admin-content: "72rem"
  admin-grid: "24px"
  admin-task-margin: "2.75rem"
  admin-aside: "20rem"
  admin-product-aside: "22rem"
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
  admin-button-primary:
    backgroundColor: "{colors.cuaderno-primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.admin-label}"
    rounded: "{rounded.admin-sheet}"
    padding: "8px 16px"
    height: "{spacing.control-height}"
  admin-button-outline:
    backgroundColor: "{colors.cuaderno-paper}"
    textColor: "{colors.cuaderno-ink}"
    typography: "{typography.admin-label}"
    rounded: "{rounded.admin-sheet}"
    padding: "8px 16px"
    height: "{spacing.control-height}"
  admin-sheet:
    backgroundColor: "{colors.card}"
    textColor: "{colors.cuaderno-ink}"
    rounded: "{rounded.admin-sheet}"
    padding: "24px"
  admin-filter-chip:
    backgroundColor: "{colors.card}"
    textColor: "{colors.cuaderno-ink}"
    typography: "{typography.admin-label}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "{spacing.control-height}"
  admin-filter-chip-active:
    backgroundColor: "{colors.cuaderno-primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.admin-label}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "{spacing.control-height}"
  admin-status-badge:
    backgroundColor: "{colors.cuaderno-muted}"
    textColor: "{colors.cuaderno-ink}"
    typography: "{typography.admin-label}"
    rounded: "{rounded.pill}"
    padding: "0 10px"
    height: "24px"
  admin-status-badge-paused:
    backgroundColor: "{colors.cuaderno-muted}"
    textColor: "{colors.cuaderno-muted-foreground}"
    typography: "{typography.admin-label}"
    rounded: "{rounded.pill}"
    padding: "0 10px"
    height: "24px"
  admin-rail-link-active:
    backgroundColor: "{colors.cuaderno-accent}"
    textColor: "{colors.cuaderno-accent-foreground}"
    rounded: "{rounded.admin-sheet}"
    padding: "0 12px"
    height: "{spacing.control-height}"
  admin-tab-bar:
    backgroundColor: "{colors.card}"
    textColor: "{colors.cuaderno-muted-foreground}"
    height: "{spacing.admin-tabbar}"
---

# Design System: AROMA

> **Tres mundos en este repositorio.** El sitio público (todo lo que vive bajo `src/app/(public)`, envuelto en la clase `.plaza`) usa el mundo **«Vitrina de productoras»**, que es el que describen los tokens sin prefijo del encabezado. La administración (`/admin`, todo lo que envuelve `AdminShell` con la clase `.cuaderno`) usa el mundo **«Cuaderno de la asociación»**, con los tokens `cuaderno-*`, `correction` y `admin-*`. La página 404 y las pantallas de acceso (inicio de sesión y registro con Clerk, y los avisos de acceso denegado del admin, que se muestran en lugar de `AdminShell`) quedan fuera de `.cuaderno` y siguen en el mundo anterior, **«etiqueta de origen»**, con los tokens de `:root`, hasta que se rediseñen. Cada sección marca qué parte corresponde a cada mundo.

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

- **Verde de acción AROMA** (`primary`, también `ring`): el botón principal de WhatsApp («Consultar por WhatsApp», «Escribir a la Alianza AROMA» de compras por volumen), el pin de la franja de utilidades, los enlaces de texto («Ver ficha completa», «Más productos (N)»), el subrayado al pasar sobre nombres de producto y organización, el hover de los enlaces del pie y el contorno de foco. Texto blanco encima (`primary-foreground`). Es un verde algo más oscuro que el `primary` de `:root` (404 y acceso), para que el texto blanco tenga contraste holgado.

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

### Cuaderno de la asociación (admin)

Papel blanco con una cuadrícula azul apenas visible, hojas blancas encima y tinta grafito; un azul de tinta para todo lo que se puede hacer y el rojo de la corrección de un profesor solo para lo que falta. Los tokens se declaran en `.cuaderno` (en `AdminShell` y en la hoja «Más») y reemplazan a los de `:root` dentro del admin; los valores canónicos son los OKLCH `cuaderno-*` y `correction` del encabezado. Solo hay modo claro.

- **Tinta azul** (`cuaderno-primary`, también `ring`, `caret-color` y `accent-color`): botones principales («Nuevo producto», «Guardar»), enlaces, la palabra de acción de cada fila de «Te falta» («Completar ›», «Agregar ›», «Revisar ›»), las cifras del inicio distintas de cero, el filtro de estado activo, la pestaña y el icono del destino actual, los iconos de la hoja «Más», la marca de requisito cumplido y el contorno de foco. Texto blanco encima.
- **Velo azul** (`cuaderno-accent`) con **tinta azul profunda** (`cuaderno-accent-foreground`): el destino actual en el riel y en «Más», el aviso de confirmación; al 50–60 %, el hover de filas, cifras y tablas.
- **Rojo de corrección** (`correction`): solo lo que falta. El anillo de 2 px (20 px en «Te falta», 12 px junto a las notas de las listas), la línea de margen de 1 px al 70 % del cuaderno «Te falta», su título «Te falta», la equis de un requisito para publicar sin cumplir y las notas «No tiene foto» y los huecos del perfil en las listas.
- **Rojo de error** (`cuaderno-destructive`): errores de validación bajo el campo, `FormAlert`, el aviso de error y las acciones que retiran algo. Es otro trabajo que la corrección: algo salió mal o se va a borrar, no algo falta.
- **Papel** (`cuaderno-paper`) con la **línea de cuadrícula** (`cuaderno-grid-line`) cada 24 px (`bg-grid-paper`): solo el suelo de la página, nunca dentro de una hoja.
- **Hoja blanca** (`card`): secciones, tablas, formularios, cifras, el riel lateral, la barra superior y la barra de pestañas.
- **Grafito** (`cuaderno-ink`): texto, nombres y estados publicados o activos.
- **Grafito gastado** (`cuaderno-muted-foreground`): notas, ayuda, fechas, «(opcional)», el conteo tras «Te falta», cifras en cero, lo pausado e inactivo, pestañas no actuales.
- **Niebla azul** (`cuaderno-muted`): fondo de las insignias de estado, cabecera de tablas al 60 %, miniaturas vacías y el hover del riel.
- **Línea azul gris** (`cuaderno-border`): borde de 1 px de hojas, tablas y barras, y los divisores entre filas. **Borde de campo** (`cuaderno-input`): contorno de los controles.
- Selección de texto en azul claro (`oklch(0.88 0.06 262)`) con letra grafito.

**The Blue Ink Rule.** El azul es solo para lo que se puede hacer: acciones, enlaces, el destino actual y el foco. El estado se lee en grafito y se distingue por su forma (punto lleno, anillo, dos barras, cuadrado vacío), nunca por un color propio.

**The Correction Mark Rule.** El rojo de corrección marca solo lo que falta, con un anillo y la línea fina de 1 px del margen. Nunca una franja gruesa al costado, un relleno ni un error del sistema (eso es `cuaderno-destructive`).

**The Grey Pause Rule.** Lo pausado o inactivo pierde el color: insignia en grafito gastado, miniatura en escala de grises y cifra en cero en gris.

### Mundo anterior (404 y acceso)

La página 404, el inicio de sesión y el registro con Clerk y los avisos de acceso denegado del admin conservan los tokens de `:root` de la «etiqueta de origen»: papel `#F6F1E7` de fondo, tarjeta hueso `#FFFDF8`, arena `#ECE4D5`, tinta `#1D1915`, verde acción `#3F7518` (`primary`, texto blanco a 5,6:1), verde marca `#4B8C1C` (solo superficies e ilustración), bordó `#5F0400` (superficie institucional, nunca títulos; también la selección de texto fuera de `.plaza` y `.cuaderno`) y naranja `#E24C11` (acento escaso, nunca texto pequeño). El modo claro es la superficie validada; los tokens oscuros heredados no están certificados.

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

### Cuaderno de la asociación (admin)

**Fuente única:** Atkinson Hyperlegible Next (`--font-atkinson` vía `next/font`), dibujada para leerse bien, para líderes con poca práctica digital que leen en el celular al aire libre. `.cuaderno` la fija como familia de todo, con cifras tabulares, y dentro del cuaderno `.font-heading` hereda la misma familia.

- **Título de página** (`admin-title`, 700, 1.75rem → 2rem desde 768 px, −0.015em, `text-balance`): el h1 de `AdminPageHeader` y el saludo «Hola, {nombre}».
- **Título de sección** (`admin-section`, 700, 1.125rem): el h2 de `AdminSection` y la leyenda de `FormSection`.
- **Cifra** (`admin-figure`, 700, 1.75rem, 1): los conteos del inicio, en azul o, en cero, en grafito gastado.
- **Cuerpo** (`admin-body`, 400, 1rem): texto y controles (16 px, sin zoom en el celular); los nombres en filas y las etiquetas de campo en 700.
- **Nota** (`admin-note`, 400, 0.875rem, grafito gastado): ayuda, descripciones, «(opcional)», fechas, lo que falta bajo el nombre en «Te falta».
- **Etiqueta** (`admin-label`, 700): insignias de estado (0.8125rem), filtros, navegación del riel y palabras de acción (0.9375rem), pestañas (0.75rem, 400; 700 la actual).

**The One Family Rule.** Atkinson para todo: títulos, cifras, etiquetas y datos, con cifras tabulares. Sin serif, sin monoespaciada, sin mayúsculas espaciadas.

**The No Kicker Rule (admin).** No hay antetítulo ni etiqueta sobre los títulos del admin (la prop `eyebrow` de `AdminPageHeader` se ignora). El contexto de la asociación va en la barra superior del celular y en el texto («tu asociación», «Tus productos»).

**The Consequence Help Rule.** El texto de ayuda aparece solo donde una decisión tiene una consecuencia que no se ve («No se puede cambiar después de crear el producto.») o donde un ejemplo ahorra una duda («Vereda, municipio o finca.»); nunca para anunciar un límite de caracteres: el límite se aplica en silencio y, cuando quedan pocos (10 % del límite, al menos 10), aparece bajo el campo «Te quedan N caracteres.», que pasa a rojo de corrección al llegar al límite (`CharacterBudget`, un solo listener en el shell que llena el espacio que deja cada `Field`). Un campo opcional lo dice con «(opcional)» en grafito gastado junto a su etiqueta.

### Mundo anterior (404 y acceso)

Bricolage Grotesque (variable con tamaño óptico, `font-heading`) para los títulos; Geist para interfaz y texto corrido. Los campos de Clerk usan 16 px.

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

### Cuaderno de la asociación (admin)

- **Marco (`AdminShell`):** desde 768 px, un riel lateral blanco de 15rem pegado a la ventana, con borde fino a la derecha: logo arriba, los destinos, y al pie «Ver la vitrina», la cuenta y «Cerrar sesión». En celular, una barra superior blanca de 56 px pegada arriba (logo y el nombre de la asociación o «Alianza AROMA») y la barra de pestañas fija abajo.
- **Área de trabajo:** sobre el papel cuadriculado, hasta 72rem, con márgenes de 16, 24 y 40 px y 24 px arriba (40 px desde 768 px). Abajo reserva la altura de la barra de pestañas (`--admin-tabbar-height`, 0 donde no hay barra) más 2rem.
- **Inicio:** el saludo y una línea de estado («3 productos en la vitrina.»). Desde 1024 px, «Te falta» a la izquierda y una columna de 20rem con las tres cifras y las acciones; en celular, apilados: «Te falta», cifras y el botón a todo el ancho.
- **Producto en el admin** (`/admin/products/[id]`): desde 1280 px, dos columnas: el trabajo (presentaciones, imágenes, foto para el inicio) a la izquierda y una columna de 22rem que se desplaza con la página con «Publicación» e «Información». Debajo de 1280 px el orden es «Publicación», el trabajo (presentaciones, imágenes, foto para el inicio) e «Información»: lo que falta para publicar queda justo encima de dónde se arregla.
- **Trabajo y costado (desde 1280 px):** la misma estructura vale donde una página tiene una tarea larga y piezas que actúan por su cuenta: el trabajo a la izquierda y una columna de 22rem a la derecha (en producto y asociación se desplaza con la página; en usuario, texto de contenido e imagen queda fija arriba). Perfil de asociación: el formulario y «Fotos» a la izquierda, «Logo» y «Portada» a la derecha (en celular: formulario, logo, portada, fotos). Usuario: «Datos y rol» a la izquierda, «Invitación» y «Acceso» a la derecha (una sola columna si no hay costado, como en la propia cuenta). Texto de contenido: el formulario en una hoja a la izquierda, «Texto original» a la derecha. Imagen de producto: la foto de 18rem y su lugar («Imagen principal» o «Usar como principal») a la izquierda desde 1024 px, el texto alternativo en una hoja a la derecha. Los formularios cortos (presentación, categoría, altas) quedan en una columna: estirarlos no ayuda a leerlos.
- **Listas:** filtros de estado y búsqueda en una fila desde 1024 px (la búsqueda, de 20rem, solo para el superadmin); en celular los filtros se desplazan de lado. Para la administradora de asociación los filtros aparecen solo al llegar desde una cifra del inicio: tiene pocos productos.
- **Formularios:** cada `FormSection` es una hoja que pone el título a la izquierda (12rem) solo cuando la hoja mide al menos 48rem (consulta de contenedor); en una columna angosta, junto a un costado, el título va arriba de los campos.

**The Thumb Reach Rule.** En celular, tres destinos como pestañas más «Más», que abre una hoja inferior con el resto, «Ver la vitrina» y la cuenta. Superadmin: Inicio, Productos y Asociaciones; Categorías, Contenido y Usuarios bajo «Más». Administradora de asociación: Inicio, Productos y Mi asociación. El orden es el mismo en el riel.

**The One Job Per Screen Rule.** En las rutas que terminan en `/new` o `/edit` la barra de pestañas desaparece: el formulario se queda con su enlace de vuelta y su barra de guardar.

**The Sticky Save Rule.** «Cancelar» y el botón principal viven en una sola fila pegada al pie de la pantalla (sobre la barra de pestañas si existe; a 16 px del borde en escritorio). Una acción poco frecuente, como eliminar, se aparta a la izquierda de la fila desde 640 px; en celular sale de la fila y queda al final del formulario. En celular, el botón principal crece para llenar la fila.

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

**The Real Layer Rule.** Solo tiene sombra lo que de verdad está encima de otra cosa: la tarjeta sobre la foto, la barra sobre la página y el logo sobre su foto, además de menús y diálogos. En el cuaderno del admin todo es plano (hojas blancas con borde fino sobre el papel cuadriculado); solo los diálogos de confirmación y la hoja «Más» tienen sombra (`shadow-xl`).

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

Conserva su estructura de siempre y habla el idioma de la vitrina. Miga de pan en etiqueta seminegrita («← Productos / Categoría»). Arriba, dos columnas: la galería (`ProductGallery`: en escritorio, una foto grande 4:5 del ancho de la columna (comparte bordes con la «Etiqueta de origen») y, con dos o más, una fila de miniaturas de 72 px debajo, que cambia la foto grande con el fundido de 700 ms del carrusel, marca la actual con un borde de 2 px en tinta y anuncia «Foto N de M»; la galería mide lo mismo tenga 2 u 8 fotos. Tocar la foto grande (o cualquiera de la franja en celular), que lleva un ícono de ampliar en la esquina, la abre entera en la misma vista ampliada del mosaico de la asociación (`PhotoLightbox`): sobre negro, sin recorte, con «N / M», flechas, teclado y deslizar; al cerrar en otra foto, esa queda como la grande y recibe el foco. En celular, franja deslizable con la siguiente foto asomando y «N fotos · desliza para ver más». Esquinas rectas; sin fotos, el símbolo de AROMA y «Foto en camino» sobre niebla) y, a la derecha y fija al desplazarse en escritorio, la ficha en el orden de la tarjeta destacada: logo de 48 px solo si existe, nombre de la organización en serif seminegrita (enlace con subrayado verde) y su lugar en cursiva; el h1 en Source Serif 600 (2.5rem → 3.25rem, −0.02em); categoría y número de presentaciones en etiqueta de tinta gastada (sin antetítulo); la descripción corta en serif de entrada. Debajo, «Presentaciones» (`ProductPresentations`): el tablero de la tarjeta destacada, regla de 1 px en tinta, filas con nombre (y tamaño solo si el nombre no lo dice) y precio en cifra condensada de 2rem → 2.25rem («Consultar» sin precio); luego «Consultar por WhatsApp» (principal, a todo el ancho de la columna, como en la tarjeta destacada), solo salvo la nota cuando la asociación no tiene número, y debajo la nota de precios de referencia si hay algún precio. El botón queda en la primera pantalla en escritorio (1440×900, 1366×768 y 1024×768); en celular se llega bajando, después de la foto. Abajo, la «Etiqueta de origen»: panel blanco abierto por una regla de 3 px en tinta, rótulo condensado y filas de etiqueta pequeña con su valor en serif (el origen en cursiva), más la descripción de la asociación en cinco líneas; a su lado, «Sobre el producto» e «Ingredientes» con títulos y texto en serif. Cierra «Más de {nombre corto}» (título en serif; el nombre completo para lectores de pantalla), bajo una regla fina: hasta tres tarjetas del catálogo (`PlazaProductGrid`, las mismas del inicio, sin la fila de la asociación) con los otros productos de la misma asociación y, si tiene más, «Ver los N productos» hacia su perfil. Si la asociación no tiene otros productos, la sección no aparece.

### Directorio de asociaciones (`/asociaciones`)

Encabezado: «Asociaciones» en condensada mayúscula (2.75rem → 4.5rem) y, debajo a todo el ancho, la presentación editable (bloque `associations_intro`) en serif de entrada con el conteo «N asociaciones en M zonas de La Macarena». Debajo, el mapa a todo el ancho de la columna de contenido, con el territorio completo del municipio (se prefiere desplazar la página a recortarlo), y después «Todas las asociaciones» en cuadrícula.

- **Mapa del territorio (`TerritoryMap`):** dibujo propio de La Macarena generado desde OpenStreetMap (`scripts/build-territory-map.ts`, con `pnpm map:build` → `src/content/territory-map.ts`): el municipio en panel blanco con contorno de 1.5 px en tinta, los municipios vecinos en niebla con su nombre en etiqueta mayúscula, los parques Tinigua y Sierra de La Macarena con un rayado fino y borde punteado, los ríos Guayabero, Losada y Duda en tinta gastada, anillos punteados de 25, 50 y 100 km en línea recta desde el pueblo (rotulados en la sabana del suroeste, lejos de las zonas; ocultos en celular) y el pueblo como un cuadrado de tinta con «La Macarena» en serif a su derecha. Se dibuja en el servidor; el componente interactivo solo recibe el encuadre y la proyección (`territory-frame.ts`). En celular solo se rotula el pueblo. Es decorativo (`aria-hidden`); lo que ubica lo dicen los marcadores y la lista. Al pie, solo «Zonas aproximadas. Fuentes: CORPOREFUGIO (2025) y © OpenStreetMap».
- **Zonas (`src/content/territory.ts`):** lista fija de veredas y centros poblados de la alianza con su posición aproximada y su distancia al pueblo (fuente: mapa de CORPOREFUGIO, 2025). Cada asociación elige la suya en el admin («Zona en el mapa», opcional); sin zona aparece en la lista pero no en el mapa.
- **Marcadores:** botones circulares en el verde de acción, con borde blanco, sombra de capa y el número de asociaciones de la zona (24 px en celular, 36 px desde 640 px). Si dos marcadores se superpondrían (contando el agrandado del elegido), se apartan lo justo y una línea fina en tinta con un punto los une con su lugar real. Los marcadores sin vecinos cerca llevan el nombre de su zona en serif cursiva a su derecha, o encima cerca del borde derecho (desde 640 px). Pasar el cursor o enfocar uno muestra una vista previa, que espera 200 ms antes de cerrarse para que el cursor la alcance; con una vista previa abierta, cruzar otro marcador no la cambia salvo que el cursor se detenga 150 ms en él. El clic o el toque la deja fija (`aria-expanded`) hasta cerrarla con la X, Escape (el foco vuelve al marcador) o un clic fuera de las tarjetas. El marcador mostrado crece con contorno en tinta.
- **Pila de la zona (`ZoneStack`):** junto a su marcador, abierta hacia el lado con más espacio y dentro del mapa (mientras está abierta puede tapar otros marcadores); en celular, bajo el mapa: nombre de la zona en serif, distancia y, separadas por reglas finas, las asociaciones apiladas con portada pequeña, nombre en serif con enlace, número de productos y «Ver asociación →». Pasar el cursor a la vista previa la mantiene abierta para alcanzar sus enlaces.
- **«Todas las asociaciones»:** rótulo condensado y cuadrícula de 1, 2 y 3 columnas con tarjetas como las de la franja de productoras: portada 4:3 (o el símbolo y «Foto en camino») con el logo circular encima solo si existe, la línea de 3 px (en tinta mientras su zona está mostrada en el mapa), nombre en serif con enlace a toda la tarjeta, zona en cursiva con su distancia (o, sin zona, la ubicación), descripción en dos líneas y «N productos» o «Aún sin productos publicados». Están todas, también las que no tienen zona. Sin la «A» gris.

### Perfil de asociación (`/asociaciones/[asociación]`)

Misma estructura de siempre, en el idioma de la vitrina. «← Asociaciones» en etiqueta seminegrita; la portada a todo el ancho de la columna (16:9, 21:8 desde 768 px), con esquinas rectas, solo si existe. Encabezado sin antetítulo, cerrado por una regla fina: logo circular de 64 → 80 px solo si existe, nombre en Source Serif 600 (2.25rem → 3.25rem) y, debajo, la zona en cursiva con su distancia (o, sin zona, la ubicación); «Escribir por WhatsApp» en el estilo secundario, a todo el ancho en celular y al final de la línea desde 1024 px. Debajo, la descripción en serif de entrada (1.25rem → 1.375rem) y «Historia» con título en serif y texto en tinta gastada, a todo el ancho; si la asociación tiene zona, el mapa del territorio flota a la derecha (40 %) desde 1024 px y el texto lo rodea (en celular va después del texto). El mapa es la versión compacta (`TerritoryMap compact`: sin rótulos ni anillos, solo «La Macarena») en un panel blanco con borde fino y un punto verde en su zona, con el pie «zona · distancia · zona aproximada» y «Ver todas en el mapa →». Si tiene fotos, «En su territorio» (rótulo condensado): un mosaico de hasta cinco fotos (`AssociationGallery`; la primera grande; con una, ancha 16:9; con dos, lado a lado; con tres, la grande y dos apiladas; con cuatro, la grande, dos arriba y una ancha abajo; con más, la quinta dice «+N fotos»; en celular, la primera ancha y las demás en dos columnas). Al tocar una se abre la vista ampliada (`PhotoLightbox`, compartida con la ficha del producto): un diálogo a pantalla completa sobre negro, con «N / M», la foto entera, su pie en serif cursiva, flechas, teclado y deslizar; Escape o la X la cierran y el foco vuelve a la foto. Cierra «Sus productos» (rótulo condensado y el conteo) con las tarjetas del catálogo (`PlazaProductGrid`) sin la fila de la asociación, que la página ya nombra; sin productos, una frase en serif.

### Administración («Cuaderno de la asociación»)

Lo que sigue documenta el admin tal como está en el código, dentro de `.cuaderno`. Hojas blancas con borde fino y radio de 0,3rem sobre el papel cuadriculado; shadcn/ui es infraestructura adaptada a esos tokens.

- **«Te falta»** (`PendingTaskList`, signature): la página del cuaderno que abre el inicio. Hoja blanca con una línea de margen vertical de 1 px en rojo de corrección al 70 %, a 2.75rem del borde izquierdo. El título «Te falta» en rojo con el conteo «· N» en grafito gastado. Cada fila (mín. 64 px) es un enlace a la tarea exacta: en el margen, el anillo de corrección de 20 px; el asunto en negrita (producto, «Tu asociación», asociación o persona) y debajo lo que falta, en nota; a la derecha, la palabra de acción en azul con su chevrón («Completar», «Publicar», «Agregar», «Revisar»). Se ven cinco; el resto tras «Ver N más». Sin pendientes: «Todo al día» en azul y «No hay nada pendiente. Todo lo publicado se ve completo.» con una marca azul.
- **Qué cuenta como falta** (`getPendingTasks`): solo lo que una lista o la vitrina no muestran sin abrir cada ficha. Se calcula en cada visita; una fila desaparece cuando se arregla y no se descarta a mano.
  - **Administradora de asociación:** sus borradores con el primer requisito sin cumplir (o «Está listo, pero aún no se ve en la vitrina» → «Publicar»); sus productos publicados o pausados con problemas, una fila por producto con todos juntos («Sin foto y sin descripción corta»; «No se ve: su categoría está inactiva»), «Agregar» directo a subir la foto cuando solo falta la foto y «Revisar» a la ficha en los demás casos; y «Tu asociación» con los huecos del perfil.
  - **Superadmin**, en este orden: el WhatsApp de la alianza si no está configurado (sin él no se muestran sus botones de contacto); las invitaciones sin aceptar; las asociaciones activas sin ninguna cuenta activa («Nadie la administra en el panel» → «Invitar», que abre el alta de usuario con la asociación ya elegida); los productos publicados de asociaciones activas con los mismos problemas; y los huecos de perfil de las asociaciones activas.
  - **Huecos del perfil:** descripción, zona en el mapa, portada y WhatsApp (sin número, los botones de los productos escriben a la alianza); los mismos que marca `ProfileGaps` en la lista de asociaciones.
  - **No cuentan:** el logo y las fotos de la asociación (extras opcionales), los precios («Consultar» es un precio válido), los borradores y los pausados para la alianza, y que un producto publicado se quede sin presentación disponible (el sistema no lo permite).
- **Cifras del inicio** (`AdminDashboardStats`): una hoja dividida en tres (Publicados, Borradores, Pausados), cada cifra un enlace a la lista filtrada; en azul, o en grafito gastado si es cero. Debajo, el botón principal a todo el ancho de la columna: «Nuevo producto», porque las cifras de encima cuentan productos; el superadmin tiene además, en contorno, «Nueva asociación» e «Invitar a una persona».
- **AdminPageHeader**: título y, solo si dice algo que el título no, una línea en grafito gastado; la acción principal a la derecha desde 768 px y a todo el ancho en celular. En páginas internas lo antecede `AdminBackLink` («← nombre», nota en grafito gastado).
- **AdminSection**: hoja blanca con título de sección y descripción opcional; agrupa todo en las páginas internas.
- **StatusBadge** y **ActiveStatusBadge**: píldora de 24 px en niebla azul con un marcador de 8 px y la palabra, nunca solo color: punto lleno grafito «Publicado» / «Activa», anillo grafito sobre blanco con borde «Borrador», dos barras en grafito gastado «Pausado», cuadrado vacío en grafito gastado «Inactiva».
- **Lista de productos** (`/admin/products`): tabla en escritorio (Producto, Asociación para el superadmin, Categoría, Estado, Cambiado) y filas apiladas en celular con chevrón azul; miniatura de 48 px con radio pequeño (en escala de grises si está pausado; sin foto, un icono en niebla), nombre en negrita azul que abre la ficha del producto y cuyo enlace cubre toda la fila (como en asociaciones y categorías), con el ícono de la vitrina al lado cuando el público lo ve (publicado, de asociación y categoría activas) y, si falta la foto, la nota de corrección «No tiene foto» con su anillo de 12 px. Una asociación o categoría inactiva se dice en nota gris. La administradora de asociación ve aparte, bajo «De otras asociaciones» («Publicados en la vitrina. Solo para consultar.»), los productos publicados por otras asociaciones, con el nombre en negro (sin ficha que abrir) y solo el ícono de la vitrina. Filtros «Todos», «Publicados», «Borradores», «Pausados» como píldoras de 44 px con su conteo (la activa en azul lleno) y búsqueda por producto, asociación o categoría, sin importar tildes ni mayúsculas (`ProductSearch`, solo para la alianza): filtra mientras se escribe, 300 ms después de la última tecla (Enter filtra al instante), con la lupa convertida en un indicador de carga mientras llega el resultado; una X y Escape la borran y devuelven la lista completa. La búsqueda vive en la dirección (`?q=`): los filtros de estado la conservan, «volver» la recupera y los conteos de las píldoras se calculan sobre lo buscado. Sin resultados: «Nada coincide con «…».» y «Ver todos los productos».
- **Listas de gestión** (asociaciones, categorías y usuarios, superadmin): las tres funcionan igual. El nombre es el enlace azul que abre la ficha para editarla (no hay botón «Editar»); el enlace público, si existe, es un ícono junto al nombre; la única acción de la fila es activar o desactivar, un botón discreto en grafito gastado que abre su diálogo. Las cifras van solas y en una línea («3 de 4»). En celular, cada fila es nombre con su estado, una nota y una línea con las cifras a la izquierda y la acción a la derecha; nada a todo el ancho.
- **Gestión de asociaciones** (`/admin/associations`, superadmin): hoja con tabla y filas apiladas; bajo el nombre, los huecos del perfil (`ProfileGaps`) con el anillo de corrección, solo para asociaciones activas; estado con `ActiveStatusBadge`; publicados sobre el total. Desactivar y activar abren un diálogo que explica el efecto y que no se borra nada; no hay eliminación.
- **Categorías, usuarios y contenido** (superadmin): el mismo patrón de hoja con tabla en escritorio y filas en celular. Usuarios: persona, rol, asociación y estado con forma y texto («Activa», «Invitación pendiente» con círculo discontinuo, «Inactiva»). Contenido: los bloques fijos de `src/lib/site-content/blocks.ts`, cada uno con dónde aparece, una cita del texto actual con regla izquierda fina y «Editado el … por …» o «Texto original» en nota.
- **Reglas que siguen del admin anterior** (sin cambio de comportamiento): «Nueva asociación» pide solo nombre y ubicación y la dirección pública sale del nombre y no cambia; la dirección del filtro de una categoría tampoco cambia al renombrar, y «Eliminar categoría» solo aparece si ningún producto la usa (si no, la razón y «Desactivar categoría»); «Nuevo usuario» envía una invitación, que en la edición se puede reenviar o cancelar, y nadie se desactiva a sí mismo; en «Contenido», «Contacto de la alianza» es un teléfono normalizado que puede quedar vacío para ocultar los botones de contacto, y «Texto original» restaura un bloque con confirmación; «Eliminar presentación» se aparta a la izquierda de la fila de guardar (al final del formulario en celular), con confirmación, y si es la única disponible de un producto publicado se muestra la razón en su lugar.
- **Formularios** (`form-fields.tsx`): `FormSection` es una hoja con título a la izquierda en escritorio; `Field` con etiqueta en negrita y «(opcional)» en grafito gastado al lado, ayuda solo con consecuencia (ver The Consequence Help Rule), `select` nativo con chevrón, controles de 44 px con borde de campo y texto de 16 px. Validación en servidor: `FormAlert` con `role="alert"`, error bajo cada campo en rojo de error con icono (`aria-invalid`, `aria-describedby`), foco en el primer campo inválido y valores conservados. `FormActions`: la fila pegada de «Cancelar» (contorno) y el botón principal (ver The Sticky Save Rule); hoja propia sobre el papel, y solo una regla superior cuando vive dentro de una hoja, para no anidar tarjetas. Una acción rara y destructiva («Eliminar presentación», «Eliminar imagen», «Eliminar categoría») va a la izquierda de esa barra desde 640 px, apartada de «Cancelar» y del botón principal; en celular sale de la barra y queda al final del formulario, justo antes de ella, fuera del alcance del pulgar. Cuando no se puede eliminar (una categoría que usan productos, la última presentación disponible de un producto publicado), no se muestra un botón rojo deshabilitado: en su lugar va la razón, corta y en grafito gastado («No se puede eliminar: 4 productos la usan.»), y, si existe, la alternativa como acción («Desactivar categoría»), cuyo diálogo explica la consecuencia. Todo formulario vive en una hoja blanca, también los cortos (presentación, categoría, altas, imagen nueva). Los montos se muestran como en la lista: el precio de referencia con punto de miles («18.500») y la cantidad con coma decimal («1,5»).
- **Producto en el admin** (`/admin/products/[id]`): «Publicación» con `StatusBadge`, una frase de lo que ve el público y, si no está publicado, «Requisitos para publicar» como lista entre reglas finas (marca azul cumplido, equis de corrección pendiente); «Pausar» con diálogo. «Información», «Presentaciones» (o `AdminEmptyState`), «Imágenes» y «Foto para el inicio».
- **Imágenes** (`ImageFieldForm`, `ProductImagesPanel`, `AssociationPhotosPanel`): vistas previas con radio pequeño y borde sobre niebla (logo cuadrado de 128 px, portada 21:8, foto para el inicio 16:9 con sus recortes del carrusel en computador 15:7 y celular 4:3, fotos de la asociación 4:3, fotos del producto 4:5 con «Principal» en la primera, en una grilla de al menos 9,5rem por foto para que quepan sus tres controles —mover antes, mover después y el lápiz de editar— sin texto debajo, porque el texto alternativo es opcional y no se marca como faltante); sin imagen, el símbolo de AROMA en gris. La subida reduce la foto en el navegador y lo dice; «Quitar foto» con confirmación. Hasta 8 fotos de producto y 8 de la asociación, con texto alternativo y, en las de la asociación, pie de foto opcional.
- **AdminNotice**: mensaje de una línea en una caja con borde y radio, en negrita: confirmación en velo azul con icono azul (`role="status"`), nota en blanco con icono azul de información y error en rojo de error (`role="alert"`). Sin franjas laterales.
- **AdminEmptyState**: hoja blanca con borde discontinuo, icono en niebla, título breve y texto que explica cuándo aparecerá contenido; admite una acción.
- **Ver una imagen completa** (`ImageZoom`): toda vista previa recortada del admin (fotos del producto y su edición, logo, portada, foto para el inicio y fotos de la asociación) es un botón con cursor de lupa y un ícono de ampliar en la esquina; al tocarla abre un diálogo con la imagen entera, sin recorte y tan grande como permita la pantalla, sobre un velo casi opaco en tinta azulada, con su tamaño real en píxeles («1600 × 1200 px») para notar una foto pequeña o borrosa. Muestra el archivo original tal como está guardado, no una copia optimizada, y solo lo descarga al abrirse. Se cierra con la X, Escape o tocando fuera, y el foco vuelve a la miniatura. Las miniaturas de la lista de productos no lo tienen: su clic abre la ficha.
- **ConfirmActionButton**: diálogo con título en negrita, explicación en grafito gastado, «Cancelar» (contorno) y confirmar (azul, o rojo de error lleno para las acciones que retiran algo); en celular los botones se apilan con el principal arriba. Hoja blanca de radio pequeño con sombra suave y fondo velado en tinta azulada. Se dibuja en un portal fuera del panel, así que el popup lleva la clase `.cuaderno` para heredar sus tokens y su tipografía; todo lo que el admin abra en un portal debe hacer lo mismo (el panel «Más» también la lleva).
- **Navegación:** en el riel, filas de 44 px con icono de 20 px: la actual en velo azul con tinta azul profunda, negrita e icono azul (`aria-current`); las demás en grafito con icono gris y hover en niebla. En celular, la barra de pestañas blanca con borde arriba: cuatro celdas de 56 px con icono de 24 px y etiqueta de 0.75rem; la actual en azul y negrita, las demás en grafito gastado. «Más» se marca si su destino está abierto.
- **Foco:** contorno de 2 px en tinta azul; en filas y celdas enlazadas, por dentro (−2 px).

### Estados fuera del cuaderno (mundo anterior)

- **404** (fuera de `.plaza` y `.cuaderno`): el símbolo, un título en Bricolage y una sola acción.
- **Acceso** (`/admin/sign-in`, `/admin/sign-up`): el formulario de Clerk con la apariencia de `clerk-appearance.ts` (sin sombras, controles de 44 px, botón principal en `primary`); el registro solo con la invitación y, sin ella, una tarjeta explica que el acceso es solo por invitación.
- **Avisos de acceso denegado** (`AdminAccessNotice`, en lugar de `AdminShell`): explican qué pasó, muestran la cuenta y la asociación afectadas y ofrecen contactar a la alianza por WhatsApp, usar otra cuenta o volver al sitio.

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
- **Do** (admin) poner toda pantalla nueva del admin dentro de `AdminShell`, con hojas blancas (`AdminSection`, `FormSection`) sobre el papel cuadriculado y Atkinson con cifras tabulares.
- **Do** (admin) usar la tinta azul solo para acciones, enlaces, el destino actual y el foco; los estados en grafito con su forma.
- **Do** (admin) marcar lo que falta con el anillo de corrección y llevar a la tarea exacta; sumar a `getPendingTasks` solo lo que de verdad impide publicar o deja incompleta la vitrina.
- **Do** (admin) poner en gris lo pausado o inactivo, también su miniatura.
- **Do** (admin) dejar «Cancelar» y guardar en la fila pegada de `FormActions` y esconder la barra de pestañas en `/new` y `/edit`.

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
- **Don't** tomar el admin como referencia para pantallas nuevas de la vitrina.
- **Don't** publicar imágenes generadas como si fueran productos reales, ni sellos como «100 % orgánico» sin certificación.
- **Don't** (admin) usar el azul para un estado, ni el rojo de corrección para un error, una franja gruesa al costado o un relleno.
- **Don't** (admin) poner antetítulos, etiquetas en monoespaciada o mayúsculas espaciadas, serif ni otra familia que Atkinson.
- **Don't** (admin) escribir ayudas que no tengan consecuencia, como «Hasta N caracteres».
- **Don't** (admin) abrir el inicio con tarjetas de KPI ni con una tabla gris como lo primero que ve una líder.
- **Don't** (admin) llevar la cuadrícula del papel dentro de las hojas, ni sombras fuera de diálogos y la hoja «Más».
- **Don't** usar los tokens de `:root` (mundo anterior) para pantallas nuevas del admin.
