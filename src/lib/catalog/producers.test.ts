import { describe, expect, it } from "vitest";

import { getProducerLabel } from "@/lib/catalog/producers";

describe("getProducerLabel", () => {
  it("drops the generic opening of an association's name", () => {
    expect(
      getProducerLabel("Asociación de Mujeres por el Progreso de San Juan"),
    ).toBe("Mujeres por el Progreso de San Juan");
    expect(getProducerLabel("Asociación Bosque Vivo")).toBe("Bosque Vivo");
    expect(getProducerLabel("Colectivo de Mujeres Firmantes de Paz")).toBe(
      "Mujeres Firmantes de Paz",
    );
  });

  it("keeps names without a generic opening, and never returns nothing", () => {
    expect(getProducerLabel("Las Guacamayas")).toBe("Las Guacamayas");
    expect(getProducerLabel("Asociación")).toBe("Asociación");
  });
});
