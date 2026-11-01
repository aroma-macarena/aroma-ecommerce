import { describe, expect, it, vi } from "vitest";

import { createR2Storage, MediaStorageError } from "@/lib/storage/r2";

const config = {
  accountId: "account",
  accessKeyId: "key-id",
  secretAccessKey: "secret",
  bucket: "aroma-media",
};

function storageWith(response: Response | Error) {
  const fetchImpl = vi.fn(async (request: Request) => {
    void request;
    if (response instanceof Error) {
      throw response;
    }
    return response;
  });

  return {
    storage: createR2Storage(config, fetchImpl as unknown as typeof fetch),
    lastRequest: () => fetchImpl.mock.calls.at(-1)?.[0] as Request,
  };
}

describe("createR2Storage", () => {
  it("uploads with a signed request to the bucket", async () => {
    const { storage, lastRequest } = storageWith(new Response(null));

    await storage.put(
      "products/p1/image.webp",
      new Uint8Array([1, 2, 3]),
      "image/webp",
    );

    const request = lastRequest();
    expect(request.method).toBe("PUT");
    expect(request.url).toBe(
      "https://account.r2.cloudflarestorage.com/aroma-media/products/p1/image.webp",
    );
    expect(request.headers.get("content-type")).toBe("image/webp");
    expect(request.headers.get("authorization")).toMatch(/^AWS4-HMAC-SHA256 /);
    expect(request.headers.get("authorization")).not.toContain("secret");
  });

  it("treats deleting a missing object as done", async () => {
    const { storage, lastRequest } = storageWith(
      new Response(null, { status: 404 }),
    );

    await expect(storage.delete("products/p1/gone.webp")).resolves.toBe(
      undefined,
    );
    expect(lastRequest().method).toBe("DELETE");
  });

  it("reports storage failures as MediaStorageError", async () => {
    await expect(
      storageWith(new Response(null, { status: 500 })).storage.put(
        "a.webp",
        new Uint8Array([1]),
        "image/webp",
      ),
    ).rejects.toBeInstanceOf(MediaStorageError);
    await expect(
      storageWith(new Response(null, { status: 403 })).storage.delete("a.webp"),
    ).rejects.toBeInstanceOf(MediaStorageError);
    await expect(
      storageWith(new TypeError("fetch failed")).storage.delete("a.webp"),
    ).rejects.toBeInstanceOf(MediaStorageError);
  });
});
