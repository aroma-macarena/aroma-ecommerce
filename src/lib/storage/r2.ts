import "server-only";

import { AwsClient } from "aws4fetch";

/**
 * Cloudflare R2 through its S3-compatible API. Credentials come from
 * server-only environment variables and are never sent to the browser:
 * requests are signed here and only public URLs reach the client.
 */
export type MediaStorage = {
  put(
    key: string,
    body: Uint8Array<ArrayBuffer>,
    contentType: string,
  ): Promise<void>;
  delete(key: string): Promise<void>;
};

export class MediaStorageError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "MediaStorageError";
  }
}

type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
};

function readR2Config(): R2Config | null {
  const config = {
    accountId: process.env.R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucket: process.env.R2_BUCKET,
  };

  return Object.values(config).every(Boolean) ? (config as R2Config) : null;
}

/** Whether uploads can work: R2 credentials and the public media URL. */
export function isMediaStorageConfigured() {
  return Boolean(readR2Config() && process.env.NEXT_PUBLIC_MEDIA_BASE_URL);
}

export function createR2Storage(
  config: R2Config,
  fetchImpl: typeof fetch = fetch,
): MediaStorage {
  const client = new AwsClient({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    service: "s3",
    region: "auto",
  });
  const objectUrl = (key: string) =>
    `https://${config.accountId}.r2.cloudflarestorage.com/${config.bucket}/${key
      .split("/")
      .map(encodeURIComponent)
      .join("/")}`;

  async function send(key: string, init: RequestInit) {
    let response: Response;

    try {
      const request = await client.sign(objectUrl(key), init);
      response = await fetchImpl(request);
    } catch (error) {
      throw new MediaStorageError("Could not reach media storage", {
        cause: error,
      });
    }

    return response;
  }

  return {
    async put(key, body, contentType) {
      const response = await send(key, {
        method: "PUT",
        body,
        headers: {
          "Content-Type": contentType,
          // Keys are never reused, so the object can be cached for good.
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });

      if (!response.ok) {
        throw new MediaStorageError(
          `Upload failed with status ${response.status}`,
        );
      }
    },

    async delete(key) {
      const response = await send(key, { method: "DELETE" });

      // A missing object is already gone, which is what deleting wants.
      if (!response.ok && response.status !== 404) {
        throw new MediaStorageError(
          `Delete failed with status ${response.status}`,
        );
      }
    },
  };
}

/** The configured storage; throws when R2 is not configured. */
export function getMediaStorage(): MediaStorage {
  const config = readR2Config();

  if (!config) {
    throw new MediaStorageError("Media storage is not configured");
  }

  return createR2Storage(config);
}
