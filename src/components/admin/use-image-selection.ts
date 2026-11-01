"use client";

import { useEffect, useRef, useState } from "react";

import {
  ImageReductionError,
  type ReducedImage,
  reduceImage,
} from "@/lib/image-reduction";

export type ImageSelection =
  | { status: "empty" }
  | { status: "preparing" }
  | {
      status: "ready";
      image: ReducedImage;
      previewUrl: string;
      sourceName: string;
    }
  | { status: "error"; message: string };

const reductionMessages = {
  TOO_LARGE: "La foto pesa más de 20 MB. Elige una más liviana.",
  UNREADABLE: "No pudimos leer esta imagen. Usa una foto en JPG, PNG o WebP.",
};

export function formatFileSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toLocaleString("es-CO", {
        maximumFractionDigits: 1,
      })} MB`;
}

/**
 * A photo chosen in a file input, reduced in the browser before upload, with
 * a preview URL that is released when replaced or unmounted.
 */
export function useImageSelection(maxDimension?: number) {
  const [selection, setSelection] = useState<ImageSelection>({
    status: "empty",
  });
  const previewUrl = useRef<string | null>(null);
  // Counts selections so a slower reduction of an earlier file cannot
  // replace the latest one.
  const latestSelection = useRef(0);

  useEffect(
    () => () => {
      if (previewUrl.current) {
        URL.revokeObjectURL(previewUrl.current);
      }
    },
    [],
  );

  async function selectFile(file: File | undefined) {
    const selectionId = ++latestSelection.current;
    const isStale = () => selectionId !== latestSelection.current;

    if (previewUrl.current) {
      URL.revokeObjectURL(previewUrl.current);
      previewUrl.current = null;
    }

    if (!file) {
      setSelection({ status: "empty" });
      return;
    }

    setSelection({ status: "preparing" });

    try {
      const image = await reduceImage(file, maxDimension);

      if (isStale()) {
        return;
      }

      previewUrl.current = URL.createObjectURL(image.file);
      setSelection({
        status: "ready",
        image,
        previewUrl: previewUrl.current,
        sourceName: file.name,
      });
    } catch (error) {
      if (isStale()) {
        return;
      }

      setSelection({
        status: "error",
        message:
          error instanceof ImageReductionError
            ? reductionMessages[error.code]
            : reductionMessages.UNREADABLE,
      });
    }
  }

  return { selection, selectFile };
}
