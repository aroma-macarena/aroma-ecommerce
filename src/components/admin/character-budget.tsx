"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Characters left at which the count appears: 10 % of the limit, at least 10. */
function threshold(maxLength: number) {
  return Math.max(10, Math.round(maxLength * 0.1));
}

function update(target: EventTarget | null) {
  if (
    !(target instanceof HTMLInputElement) &&
    !(target instanceof HTMLTextAreaElement)
  ) {
    return;
  }
  if (target.maxLength <= 0 || !target.id) return;

  const slot = document.querySelector<HTMLElement>(
    `[data-char-budget="${CSS.escape(target.id)}"]`,
  );
  if (!slot) return;

  const remaining = target.maxLength - target.value.length;
  if (remaining > threshold(target.maxLength)) {
    slot.hidden = true;
    slot.textContent = "";
    return;
  }

  slot.hidden = false;
  slot.dataset.full = remaining <= 0 ? "true" : "false";
  slot.textContent =
    remaining <= 0
      ? "Llegaste al límite de caracteres."
      : `Te ${remaining === 1 ? "queda 1 carácter" : `quedan ${remaining} caracteres`}.`;
}

/**
 * Fields keep their limit without announcing it: a field's count appears
 * under it only when few characters are left. One listener for the whole
 * admin, filling the slot each `Field` renders.
 */
function CharacterBudget() {
  const pathname = usePathname();

  useEffect(() => {
    const onInput = (event: Event) => update(event.target);
    document.addEventListener("input", onInput, true);
    // Prefilled values close to the limit show their count on arrival.
    document
      .querySelectorAll("input[maxlength], textarea[maxlength]")
      .forEach(update);
    return () => document.removeEventListener("input", onInput, true);
  }, [pathname]);

  return null;
}

export { CharacterBudget };
