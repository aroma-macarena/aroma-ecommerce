export type ImageFormState = {
  status: "idle" | "error";
  /** Increases on every failed submission so the form can restore values. */
  attempt: number;
  message?: string;
  fieldErrors?: Partial<Record<"file" | "altText", string>>;
  values?: { altText: string };
};

export const MAX_ALT_TEXT_LENGTH = 300;

/** Help for the alt text field, shared by uploading and editing an image. */
export const ALT_TEXT_HINT = `Describe lo que se ve para quien no puede ver la imagen, por ejemplo «Bolsa de café de 250 g sobre una mesa de madera». Si lo dejas vacío, se usa el nombre del producto. Hasta ${MAX_ALT_TEXT_LENGTH} caracteres.`;
