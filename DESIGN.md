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
- Ancho de texto: los párrafos largos se limitan a una medida cómoda de lectura; las frases cortas (descripciones de cabecera, estados vacíos) ocupan el ancho disponible para no partirse sin necesidad.
- En el admin, el contexto de la asociación va en el antetítulo; títulos y textos usan «tu asociación» o «Tus productos» en lugar de repetir su nombre.
- La entrada `/` es la vitrina: titular, cifras de la alianza y foto del territorio; después, productos con filtros; al final, la banda de la alianza con las organizaciones y el sello. `/productos` redirige a la entrada conservando la categoría.
- La foto de la entrada es contenido institucional estático (`src/assets`), optimizada por `next/image`. Las fotos de productos se suben desde el admin a Cloudflare R2 y se muestran con `getMediaUrl`.
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
- `symbol`: cabecera bajo 480 px, fichas sin foto y la página 404. Los avisos de acceso al admin usan el logo sin descripción sobre la tarjeta.
- `aroma-sello.svg`: una vez por pantalla y a 112 px o más (banda de la alianza, futuro detalle de producto).

## Componentes

- **ProductCard**: sin caja. Imagen 4:3 en móvil y 4:5 desde tablet, categoría en mono verde, nombre en display, descripción completa y línea de origen con la organización bajo una regla en tinta. Toda la tarjeta lleva al detalle: el enlace es el nombre y se extiende sobre la tarjeta, que muestra el foco alrededor y subraya el nombre al pasar el cursor.
- **Detalle de producto** (`/productos/[asociación]/[producto]`): ruta con «Productos / categoría»; galería a la izquierda en escritorio (la principal grande y las demás en dos columnas) y una tira deslizable en móvil, sin JavaScript; a la derecha, categoría en mono verde, nombre en display, asociación y lugar en mono, descripción corta, presentaciones y contacto. Debajo, la **etiqueta de origen**: un panel con borde en tinta y filas en mono (organización, origen, categoría, disponibilidad) y la descripción de la asociación, junto a «Sobre el producto» e «Ingredientes». Solo se muestra lo que existe.
- **Presentaciones públicas**: solo las disponibles, en su orden, como filas de etiqueta bajo una regla en tinta: nombre, tamaño en mono y precio en display a la derecha, con la nota de que son precios de referencia.
- **Contacto por WhatsApp**: botón principal «Consultar por WhatsApp» con el logo de WhatsApp en un solo color (el del texto del botón, nunca el verde de WhatsApp) con un mensaje que nombra el producto y pregunta por él, sin hablar de pedidos, y la nota de que AROMA no procesa pagos ni pedidos. Sin número de la asociación, un aviso y, si está configurado, «Escribir a la Alianza AROMA».
- **CategoryFilter**: pestañas con subrayado naranja sobre una regla, desplazables en móvil. Usa enlaces y el parámetro `categoria`, sin JavaScript de cliente.
- **Navegación pública**: mismo subrayado para la página activa, anunciada con `aria-current`. En la entrada, «La alianza» se resalta mientras su sección ocupa el centro de la pantalla, y el ancla compensa la altura de la cabecera fija (`scroll-padding-top`). Tres enlaces: «Productos» (activo también en las fichas, con `aria-current="true"`), «Asociaciones» (activo en el directorio y los perfiles) y «La alianza». Bajo 480 px la cabecera usa el símbolo y enlaces más compactos para quedar en una línea desde 340 px.
- **Banda de la alianza**: bordó a todo el ancho, lema, descripción, sello y lista de organizaciones con su número de integrantes; al final, bajo la regla de la lista, el enlace «Conoce las asociaciones». Los datos viven en `src/content/home.ts`; el directorio, en cambio, sale de la base de datos.
- **Directorio de asociaciones** (`/asociaciones`): `SectionHeading` como h1 y una lista sin cajas bajo una regla en tinta. Cada fila lleva el logo en una baldosa cuadrada (o el símbolo), nombre en display, lugar en mono, descripción en dos líneas y la cantidad de productos publicados en mono; toda la fila enlaza al perfil, como las tarjetas de producto.
- **Perfil de asociación** (`/asociaciones/[asociación]`): una sola columna al ancho del contenedor (los párrafos con una medida de lectura de `max-w-3xl`), con portada y logo solo si existen (sin foto inventada ni recuadro vacío), antetítulo «Asociación de la Alianza AROMA», nombre, lugar, descripción e «Historia». El contacto es secundario: un botón de contorno «Escribir por WhatsApp» al final de la línea del nombre en pantallas grandes y a todo el ancho bajo la cabecera en móvil, sin panel ni nota, porque el paso comercial está en las fichas de producto; si no hay número, no aparece. No se publica el nombre de la persona de contacto. Debajo, «Sus productos» con `ProductCard` sin repetir la asociación. La ficha de producto enlaza a este perfil desde el nombre de la asociación.
- **AdminPageHeader**: antetítulo opcional (asociación o alianza), título en display y regla en tinta. En páginas internas lo antecede `AdminBackLink` hacia la lista. Su acción principal ocupa el ancho total en móvil, como las acciones de los formularios.
- **Lista administrativa de productos** (`/admin/products`): tabla en escritorio y filas apiladas en móvil, con producto, categoría, asociación cuando aplica, estado y acción. El superadmin ve una sola lista; el admin de asociación ve sus productos y, aparte, los publicados por otras asociaciones activas como «Solo lectura». La visibilidad y el permiso de gestión se calculan en el servidor. Categorías y asociaciones inactivas se señalan con una nota en mono.
- **Gestión de asociaciones** (`/admin/associations`, solo superadmin): tabla en escritorio y filas apiladas en móvil, como la lista de productos, con nombre, ubicación y «Ver perfil público» si está activa, estado (`ActiveStatusBadge`: «Activa» con círculo verde, «Inactiva» con cuadrado vacío), productos publicados sobre el total y cuentas de administración. «Nueva asociación» pide solo nombre y ubicación; la dirección pública sale del nombre y no cambia. «Editar» abre el editor de perfil de la asociación. «Desactivar» y «Activar» abren un diálogo que explica el efecto (vitrina, perfil y acceso de sus administradoras) y aclara que no se borra nada. No hay eliminación.
- **Gestión de categorías** (`/admin/categories`, solo superadmin): mismo patrón que asociaciones, con nombre, descripción en dos líneas, «Ver en la vitrina» si tiene productos publicados, estado y uso («3 publicados de 5 productos» o «Sin productos»). Crear y editar piden nombre y descripción; la dirección del filtro (`/?categoria=…`) sale del nombre y no cambia al renombrar. Desactivar explica que oculta sus productos y la retira de los productos nuevos sin borrar nada. «Eliminar categoría» va en la barra de acciones de la edición y solo se habilita si ningún producto la usa; si no, se deshabilita con la razón.
- **Gestión de usuarios** (`/admin/users`, solo superadmin): mismo patrón de tabla y filas, con persona (nombre, correo y «(tú)» en la propia cuenta), rol, asociación («Toda la alianza» para el superadmin, con nota si la asociación está inactiva) y estado con forma y texto: círculo verde «Activa», círculo discontinuo «Invitación pendiente» y cuadrado vacío «Inactiva». «Nuevo usuario» pide nombre, correo, rol (dos opciones con su alcance) y asociación, que solo aparece para el administrador de asociación; el botón dice «Enviar invitación». La edición muestra el correo como dato fijo (es el de su cuenta de acceso), el rol (fijo en la propia cuenta), «Invitación» con «Reenviar» y «Cancelar» mientras esté pendiente, y «Acceso» con «Desactivar» o «Activar» y su diálogo; nadie se desactiva a sí mismo.
- **Contenido** (`/admin/content`, solo superadmin): los textos institucionales son un conjunto fijo de bloques definidos en `src/lib/site-content/blocks.ts` (portada del inicio, la alianza en el inicio, presentación de las asociaciones y pie de página); no hay páginas ni bloques nuevos desde el panel. La lista muestra cada bloque con su nombre, dónde aparece, una cita con el texto actual (regla izquierda) y «Editado el … por …» o «Texto original» en mono, con «Editar» y «Ver en el sitio». La edición tiene título y texto según el bloque, con su límite y una ayuda que dice dónde se ve; los textos de una sola frase no admiten saltos de línea y el pie de página separa párrafos con una línea en blanco. Si el texto cambió, «Texto original» lo muestra y permite restaurarlo con confirmación. La base de datos guarda solo las palabras: la composición sigue en el código y, si un bloque falta o está vacío, el sitio usa su texto original.
- **Registro por invitación** (`/admin/sign-up`): el formulario de Clerk con la misma apariencia que el acceso, solo si llega con la invitación; sin ella, una tarjeta explica que el acceso es solo por invitación y lleva a «Iniciar sesión».
- **Perfil de asociación en el admin**: un mismo editor en «Mi asociación» (`/admin/association`, la administradora de la asociación) y en «Editar» de la lista de asociaciones (superadmin). Muestra la dirección pública y, con `FormSection`, «Información pública» (nombre, ubicación, descripción, historia) y «Contacto» (WhatsApp, que se guarda normalizado y se muestra como «+57 300 111 2233», y persona de contacto, que no se publica). Solo el superadmin cambia el nombre; la administradora lo ve como dato fijo con la indicación de pedírselo a la alianza. Debajo, «Logo» (baldosa cuadrada, o el símbolo) y «Portada» (21:8): cada una se guarda con su propio botón, con vista previa de la imagen reducida en el navegador, y «Quitar» con confirmación.
- **ConfirmActionButton**: diálogo de confirmación genérico con título, explicación y botón de confirmar, rojo para acciones que retiran algo. `ConfirmDeleteButton` lo usa para eliminar.
- **AdminEmptyState**: lista vacía como un espacio con borde discontinuo, icono, título breve que no repite el de la sección y texto que explica cuándo aparecerá contenido. Admite una acción opcional.
- **StatusBadge**: estado del producto con forma y texto, nunca solo color: círculo verde «Publicado», círculo vacío «Borrador», cuadrado naranja «Pausado».
- **Formulario de producto** (`/admin/products/new` y `/admin/products/[id]/edit`): secciones «Información básica» y «Detalles»; la primera se apoya en la regla de la cabecera y las siguientes se abren con una regla en tinta, para no duplicar reglas, con título y propósito a la izquierda en escritorio y encima en móvil. Etiqueta visible en cada campo, «Opcional» en mono, ayuda con el límite de caracteres y `select` nativo. La validación ocurre en el servidor: un aviso general con `role="alert"`, el error bajo cada campo (`aria-invalid` y `aria-describedby`), el foco en el primer campo inválido y los valores enviados se conservan. Acciones al final: «Cancelar» y el botón principal; en móvil, el principal va primero.
- **Contexto de edición**: la asociación va en el antetítulo y no se puede cambiar; el estado acompaña al título. El identificador web sigue al nombre mientras el producto es borrador y queda fijo al publicarse. Una categoría inactiva actual se conserva como «(inactiva)». Si el producto está publicado, un aviso con borde naranja advierte que los cambios se verán en la vitrina.
- **Página de producto** (`/admin/products/[id]`): punto de entrada para gestionar un producto; «Gestionar» la abre desde la lista y crear o editar vuelven a ella. Usa `AdminSection` (título y propósito a la izquierda en escritorio; la primera sección se apoya en la regla de la cabecera) en este orden:
  - **Publicación**: `StatusBadge`, una frase sobre qué ve el público y, si no está publicado, la lista de requisitos con marca verde o equis naranja (con texto para lectores de pantalla). La acción disponible (Publicar, Pausar o Volver a publicar) va con una nota que explica su efecto o por qué está deshabilitada. Si está publicado pero oculto por su categoría o asociación, un aviso lo explica.
  - **Presentaciones**: lista ordenada con nombre, tamaño y precio («250 g · $ 25.000»), disponibilidad en mono y controles «Subir», «Bajar» y «Editar». Sin presentaciones, un `AdminEmptyState` invita a agregar la primera.
  - **Información**: resumen en filas con etiqueta mono y «Sin completar» para lo vacío, y el enlace «Editar información».
- **Formulario de presentación**: nombre, cantidad y unidad (lado a lado desde tablet, con sugerencias de unidad), precio en pesos enteros con prefijo «$» y casilla «Disponible». «Eliminar presentación» va en la barra de acciones, a la izquierda y en rojo sin relleno, apartado de «Cancelar» y «Guardar»; en móvil queda al final. Pide confirmación en un diálogo y, si es la única presentación disponible de un producto publicado, se deshabilita con la razón debajo de la barra.
- **Imágenes del producto**: sección «Imágenes» en la página del producto, con una cuadrícula de 2 columnas en móvil y hasta 4 en escritorio, a la proporción 4:5 de la vitrina. La primera imagen es siempre la principal (la de la tarjeta en la vitrina) y lleva la etiqueta «Principal» en mono: «Usar como principal» la lleva al primer lugar y moverla al primer lugar con las flechas la vuelve principal. Debajo de cada una van el texto alternativo (o «Sin texto alternativo» atenuado), «Mover antes», «Mover después» y «Editar». Muestra cuántas hay sobre el máximo de 8. Sin imágenes, un `AdminEmptyState` explica que la vitrina usa el símbolo.
- **Subida de imágenes**: una página con vista previa 4:5, el selector de archivo y el texto alternativo opcional con un ejemplo. El navegador reduce la foto antes de enviarla y lo dice («Preparando la foto…», luego tamaño y peso finales). Los errores de lectura o tamaño aparecen bajo el campo. Editar una imagen muestra la vista previa, «Usar como principal» y el texto alternativo; «Eliminar imagen» va en la barra de acciones con confirmación.
- **AdminNotice**: mensaje de una línea con regla izquierda de 3 px: verde para confirmaciones (`role="status"`), naranja para advertencias y rojo para errores (`role="alert"`). Las confirmaciones llegan por el parámetro `estado` y los errores de acciones por `aviso`.
- **Navegación admin**: activo en verde claro con barra verde a la izquierda; las secciones pendientes muestran «Pronto» y están deshabilitadas. Cada rol ve solo sus secciones, de la más frecuente a la menos: el superadmin ve Inicio, Productos, Asociaciones, Categorías, Contenido y Usuarios; la administradora de asociación, Inicio, Productos y Mi asociación. El mismo orden rige en la barra lateral y en el menú móvil.
- **Inicio del panel** (`/admin`): saludo con la asociación o «Alianza AROMA» en el antetítulo y una descripción de lo que gestiona cada rol, sin promesas de funciones futuras. Debajo, secciones `AdminSection`. Para la administradora de asociación: «Tus productos», una franja de cifras con regla en tinta (publicados, borradores, pausados; cada cifra enlaza a la lista) o un `AdminEmptyState` con «Nuevo producto» si no tiene ninguno; «Borradores», cada uno con lo que le falta para publicarse (icono de alerta naranja) o «Listo para publicar» (marca verde), y «Accesos» con «Nuevo producto» (solo si ya tiene productos, para no repetir el del estado vacío), «Mi asociación» y «Ver perfil público» si la asociación está activa. Para el superadmin: «La alianza hoy» con asociaciones activas (sobre el total), productos publicados e invitaciones pendientes, cada cifra enlazada a su sección, y «Accesos» con «Nueva asociación», «Nuevo usuario», «Contenido» y «Ver vitrina». Las cifras se calculan en el servidor con las reglas de acceso; los botones ocupan el ancho en móvil.
- **Estados**: la 404 usa el símbolo, un título en display y una sola acción. Los avisos de acceso al admin (cuenta sin acceso, cuenta pausada, asociación pausada) explican qué pasó en un tono cercano, muestran la cuenta y la asociación afectadas y ofrecen contactar a la administración por WhatsApp (si `ALLIANCE_SUPPORT_WHATSAPP` está configurado), usar otra cuenta o volver al sitio público.
- **Foco**: contorno de 2 px en verde acción con separación de 4 px; en pestañas, contorno interior para no recortarse.

## Hacer y evitar

- Reutilizar tokens, `Container`, `Section`, `SectionHeading`, `AdminPageHeader` y `AromaLogo`.
- Mantener el contenido institucional separado de la composición (`src/content`).
- Validar teclado, 360–390 px y escritorio, con nombres largos y categorías vacías.
- No publicar imágenes generadas como si fueran productos reales, ni sellos como «100 % orgánico» sin certificación.
- No volver a tarjetas con caja para todo, píldoras rellenas ni el bordó en títulos.
