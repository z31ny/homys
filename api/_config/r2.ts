import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || '';
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || '';
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || '';
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'homys-images';

/** Public base URL for serving images (e.g. https://pub-xxx.r2.dev or custom domain) */
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || '';

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

/**
 * Generate a presigned PUT URL for direct browser upload.
 * Returns { uploadUrl, key, publicUrl }.
 */
export async function createPresignedUpload(options: {
  folder: string;
  filename: string;
  contentType: string;
}) {
  const ext = options.filename.split('.').pop() || 'jpg';
  const key = `${options.folder}/${randomUUID()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: options.contentType,
  });

  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 900 }); // 15 min
  const publicUrl = `${R2_PUBLIC_URL}/${key}`;

  return { uploadUrl, key, publicUrl };
}

/**
 * Delete an object from R2 by its key.
 */
export async function deleteR2Object(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });
  await r2Client.send(command);
}
