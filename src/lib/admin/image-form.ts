export type ImageFormState = {
  status: "idle" | "error";
  /** Increases on every failed submission so the form can restore values. */
  attempt: number;
  message?: string;
  fieldErrors?: Partial<Record<"file" | "altText", string>>;
  values?: { altText: string };
};

export const MAX_ALT_TEXT_LENGTH = 300;
