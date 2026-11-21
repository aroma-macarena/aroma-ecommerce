export type ImageFormState = {
  status: "idle" | "error";
  /** Increases on every failed submission so the form can restore values. */
  attempt: number;
  message?: string;
  fieldErrors?: Partial<Record<"file" | "altText", string>>;
  values?: { altText: string };
};

/** A form that uploads one image in place (a logo, a cover, a banner). */
export type SingleImageFormState = {
  status: "idle" | "error";
  /** Increases on every failed upload. */
  attempt: number;
  message?: string;
};

export const MAX_ALT_TEXT_LENGTH = 300;
export const MAX_CAPTION_LENGTH = 160;

/** Help for an association photo's visible caption. */
export const CAPTION_HINT = `Lo que se lee bajo la foto en grande, por ejemplo «Cosecha de cacao en la vereda El Billar». Hasta ${MAX_CAPTION_LENGTH} caracteres.`;

/** An association photo's form: upload or edit, with alt text and caption. */
export type PhotoFormState = {
  status: "idle" | "error";
  /** Increases on every failed submission so the form can restore values. */
  attempt: number;
  message?: string;
  fieldErrors?: Partial<Record<"file" | "altText" | "caption", string>>;
  values?: { altText: string; caption: string };
};

/** Help for the alt text field, shared by uploading and editing an image. */
export const ALT_TEXT_HINT = `Describe lo que se ve para quien no puede ver la imagen, por ejemplo «Bolsa de café de 250 g sobre una mesa de madera». Si lo dejas vacío, se usa el nombre del producto. Hasta ${MAX_ALT_TEXT_LENGTH} caracteres.`;
