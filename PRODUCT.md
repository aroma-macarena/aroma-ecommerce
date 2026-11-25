# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Compradores (sitio público).** Hay varios públicos y ninguno predomina:

- consumidores finales en Colombia que compran productos campesinos de origen;
- compradores institucionales (tiendas, restaurantes, cooperantes, ONG) que compran por volumen o de forma recurrente;
- visitantes y aliados (turistas, financiadores, entidades) que llegan a conocer la alianza.

Todos necesitan entender qué se ofrece, quién lo produce y cómo pedirlo.

**Administradoras de las asociaciones (`ASSOCIATION_ADMIN`).** Hay dos situaciones: algunas lideresas publican y mantienen sus productos solas, y otras lo hacen con acompañamiento del equipo de la alianza. Por eso el admin debe funcionar para personas con poca práctica digital y también para quien lo usa con soltura.

**Super administradoras de la alianza (`SUPER_ADMIN`).** Gestionan las asociaciones, las categorías, los usuarios (solo por invitación), el contenido institucional y el WhatsApp de la alianza.

## Product Purpose

AROMA es la vitrina digital de la alianza de organizaciones de mujeres campesinas de La Macarena (Meta, Colombia). Muestra los productos de cada asociación, su historia y su territorio, y lleva al comprador a una conversación directa por WhatsApp con la asociación que produce.

En esta etapa, el éxito es:

1. **Conversaciones de venta:** más clics a WhatsApp que terminan en pedidos para las asociaciones.
2. **Autonomía de las asociaciones:** que cada asociación pueda publicar y mantener sus productos sin depender de otras personas.

## Positioning

AROMA no es un marketplace genérico. Cada producto pertenece a una asociación concreta de mujeres del territorio, y la venta pasa por una conversación con ella, no por un carrito anónimo. El origen (quién, dónde y cómo) es parte del producto.

## Operating Context

- La compra se cierra fuera del sitio, por WhatsApp. El mensaje se arma con el producto y su enlace, y va al número de la asociación o, si esta no tiene, al de la alianza.
- Los precios son de referencia y se muestran por presentación (cantidad, unidad, disponibilidad). No hay carrito, pago en línea ni inventario.
- Un producto tiene tres estados: borrador, publicado o pausado. Solo los publicados de asociaciones activas son visibles al público.
- El acceso administrativo es solo por invitación (Clerk). Cada administradora de asociación ve únicamente lo de su asociación.
- Rutas públicas: inicio, productos, ficha de producto, directorio de asociaciones y perfil de asociación. Admin: resumen según el rol, productos (con imágenes y presentaciones), asociaciones, categorías, usuarios y contenido.

## Capabilities and Constraints

- Stack existente: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui sobre Base UI, Drizzle + Neon PostgreSQL, Clerk y Cloudflare R2 para las imágenes.
- Las imágenes son opcionales: sin R2 configurado, los productos muestran una imagen de reemplazo, y la interfaz no debe depender de que exista una foto.
- Los textos institucionales (portada, la alianza, la presentación de asociaciones, el pie de página y el WhatsApp de la alianza) se editan desde el admin. Las organizaciones de la alianza están como datos estructurados en `src/content/home.ts`.
- Idioma de la interfaz: español (Colombia).
- Los recorridos E2E usan roles, etiquetas y texto visible, así que un refactor de la UI debe conservar nombres accesibles coherentes.

## Brand Commitments

- Nombre: AROMA. Hay recursos de marca en `public/brand/` (logo, logo con descripción, sello y símbolo).
- Territorio: La Macarena, Meta. Fotografía del río Guayabero en `src/assets/territorio-rio-guayabero.jpg`.

## Evidence on Hand

- Las 10 organizaciones de la alianza, con sus siglas, nombres completos y número de mujeres (y de hombres, cuando aplica), están en `src/content/home.ts`.
- Los productos, las asociaciones y sus historias vienen de la base de datos y los cargan las propias asociaciones.
- No hay testimonios, cifras de ventas, prensa ni logos de financiadores confirmados. No hay que inventarlos.

## Product Principles

1. **Cada producto tiene dueña visible.** La asociación y el territorio acompañan siempre al producto.
2. **El camino a WhatsApp es corto y obvio.** Toda ficha lleva a una conversación con el contexto ya armado.
3. **El admin se puede usar sin ayuda.** Cada tarea se puede completar por quien tenga menos práctica digital, sin perder eficiencia para quien sí la tiene.
4. **Nada que la alianza no pueda sostener.** No hay que prometer ni sugerir carrito, envíos, stock en tiempo real ni pagos.
