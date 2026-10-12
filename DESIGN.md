---
name: AROMA
description: Vitrina de las organizaciones de mujeres de La Macarena con el lenguaje de una etiqueta de origen.
colors:
  primary: "#3F7518"
  brand-green: "#4B8C1C"
  brand-burgundy: "#5F0400"
  brand-orange: "#E24C11"
  background: "#F6F1E7"
  card: "#FFFDF8"
  muted: "#ECE4D5"
  accent: "#E4EDD6"
  foreground: "#1D1915"
  muted-foreground: "#5D544B"
  border: "#DDD5C6"
  input: "#8A7F72"
typography:
  display:
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "2.875rem–4.5rem"
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "1.875rem–2.75rem"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  product:
    fontFamily: "Bricolage Grotesque, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 500
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Geist, sans-serif"
    fontSize: "1rem–1.125rem"
    fontWeight: 400
    lineHeight: 1.625
  data:
    fontFamily: "Geist Mono, monospace"
    fontSize: "0.75rem–0.8125rem"
    fontWeight: 500
    letterSpacing: "0.08em"
    textTransform: uppercase
rounded:
  image: "0.225rem"
  control: "0.3rem"
  panel: "0.375rem"
spacing:
  control-height: "2.75rem"
  cta-height: "3rem"
  section-mobile: "3rem"
  section-desktop: "5rem"
---

# Design System: AROMA

## Dirección: etiqueta de origen

La interfaz toma el lenguaje de las etiquetas de productos con origen: reglas finas en lugar de cajas, datos de procedencia en tipografía monoespaciada, títulos con carácter y fotografía real del territorio y de los productos. No es artesanal ni folclórica: es el registro de un producto que sabe de dónde viene y quién lo hace.

La vitrina es editorial y visual; la administración usa el mismo lenguaje con más densidad. shadcn/ui es infraestructura: sus primitives se adaptan a estos tokens y no definen la identidad.

Referencias de patrón, no de estética: Natoora (producto como objeto curado), CrowdFarming (la organización forma parte del producto), Tropicália (territorio contemporáneo sin estereotipos), Yipao (procedencia como dato visible) y Faire (presentación para compradores sin carrito).

## Color

Cada color tiene una función:

- **Tinta** (`foreground`): títulos, texto y reglas que abren un grupo.
- **Verde acción** (`primary`, #3F7518): acciones, enlaces y estado activo del admin. Texto blanco a 5,6:1.
- **Verde marca** (`brand-green`, #4B8C1C): el del logo. Solo superficies e ilustración; con texto blanco no alcanza 4,5:1.
- **Bordó** (`brand-burgundy`, #5F0400, valor oficial del logo): superficie institucional, como la banda de la alianza. No se usa para títulos.
- **Naranja** (`brand-orange`, #E24C11): acento escaso, como el subrayado del filtro y de la navegación activos. Nunca texto pequeño.
- **Papel, hueso y arena**: fondo, superficies elevadas (cabecera, paneles) y zonas de imagen vacías.

El modo claro es la superficie validada; los tokens oscuros heredados no están certificados.

## Tipografía

- **Bricolage Grotesque** (variable con tamaño óptico, cargada con `next/font`): h1, títulos de sección, nombres de producto y cifras.
- **Geist**: interfaz y texto corrido.
- **Geist Mono** en mayúsculas espaciadas: datos de origen, categorías, antetítulos y estados.

Cada página tiene un h1. `SectionHeading` permite elegir el nivel semántico, el antetítulo y el tono (`inverse` sobre bordó). Los campos de formulario usan 16 px.

## Composición

- `Container` limita el contenido a 1152 px, con márgenes de 20, 32 y 40 px. Las secciones usan 48 px en móvil y 80 px en escritorio.
- Se diseña desde 360–390 px, sin desplazamiento horizontal.
- La entrada `/` es la vitrina: titular, cifras de la alianza y foto del territorio; después, productos con filtros; al final, la banda de la alianza con las organizaciones y el sello. `/productos` redirige a la entrada conservando la categoría.
- La foto de la entrada es contenido institucional estático (`src/assets`), optimizada por `next/image`. Las fotos de productos vendrán del almacenamiento de medios.
- No se inventa material: sin foto real, se muestra el espacio vacío con el símbolo.

## Formas, reglas y profundidad

- Radios pequeños: unos 4 px en imágenes y controles, 6 px en paneles. Las píldoras ya no se usan.
- Las reglas agrupan: una regla en tinta abre un grupo y una regla clara separa elementos dentro de él.
- Sin sombras salvo en capas superpuestas, como el menú móvil del admin. Sin gradientes, desenfoques ni animaciones decorativas.
- Áreas táctiles de al menos 44 px; CTA y pestañas de 48 px.

## Marca

SVG oficiales en `public/brand`, servidos sin optimizar mediante `AromaLogo`. Para pantalla se les quitó el contorno negro fino de las formas: a tamaños de interfaz medía menos de un píxel y dejaba bordes irregulares. Los originales para impresión los conserva la alianza.

- `horizontal` (sin descripción): cabeceras, pie y admin.
- `descriptor` (con descripción): solo a 220 px o más, como en el acceso administrativo.
- `symbol`: cabecera bajo 400 px, fichas sin foto y páginas de estado (404, acceso no habilitado).
- `aroma-sello.svg`: una vez por pantalla y a 112 px o más (banda de la alianza, futuro detalle de producto).

## Componentes

- **ProductCard**: sin caja. Imagen 4:3 en móvil y 4:5 desde tablet, categoría en mono verde, nombre en display, descripción completa y línea de origen con la organización bajo una regla en tinta. No enlaza hasta que exista el detalle.
- **CategoryFilter**: pestañas con subrayado naranja sobre una regla, desplazables en móvil. Usa enlaces y el parámetro `categoria`, sin JavaScript de cliente.
- **Navegación pública**: mismo subrayado para la página activa, anunciada con `aria-current`. En la entrada, «La alianza» se resalta mientras su sección ocupa el centro de la pantalla, y el ancla compensa la altura de la cabecera fija (`scroll-padding-top`).
- **Banda de la alianza**: bordó a todo el ancho, lema, descripción, sello y lista de organizaciones con su número de integrantes. Los datos viven en `src/content/home.ts`.
- **AdminPageHeader**: antetítulo opcional (asociación o alianza), título en display y regla en tinta.
- **Lista administrativa de productos** (`/admin/products`): tabla en escritorio y filas apiladas en móvil, con producto, categoría, asociación cuando aplica, estado y acción. El superadmin ve una sola lista; el admin de asociación ve sus productos y, aparte, los publicados por otras asociaciones activas como «Solo lectura». La visibilidad y el permiso de gestión se calculan en el servidor. Categorías y asociaciones inactivas se señalan con una nota en mono.
- **AdminEmptyState**: lista vacía como un espacio con borde discontinuo, icono, título breve que no repite el de la sección y texto que explica cuándo aparecerá contenido. Admite una acción opcional.
- **StatusBadge**: estado del producto con forma y texto, nunca solo color: círculo verde «Publicado», círculo vacío «Borrador», cuadrado naranja «Pausado».
- **Acciones pendientes**: mientras no existan crear y editar, «Nuevo producto» y «Editar» se muestran deshabilitados con «Pronto», sin enlazar a rutas inexistentes.
- **Navegación admin**: activo en verde claro con barra verde a la izquierda; las secciones pendientes muestran «Pronto» y están deshabilitadas.
- **Estados**: la 404 y los avisos de acceso usan el símbolo, un título en display y una sola acción.
- **Foco**: contorno de 2 px en verde acción con separación de 4 px; en pestañas, contorno interior para no recortarse.

## Hacer y evitar

- Reutilizar tokens, `Container`, `Section`, `SectionHeading`, `AdminPageHeader` y `AromaLogo`.
- Mantener el contenido institucional separado de la composición (`src/content`).
- Validar teclado, 360–390 px y escritorio, con nombres largos y categorías vacías.
- No publicar imágenes generadas como si fueran productos reales, ni sellos como «100 % orgánico» sin certificación.
- No volver a tarjetas con caja para todo, píldoras rellenas ni el bordó en títulos.
