const fs = require('fs');
if (fs.existsSync('.env')) {
  const envConfig = fs.readFileSync('.env', 'utf8');
  for (const line of envConfig.split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      process.env[key] = process.env[key] || value.trim();
    }
  }
}
const { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const sharp = require('sharp');

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

const BUCKET = process.env.R2_BUCKET_NAME;

async function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

async function processAllImages() {
  console.log('🚀 Starting Cloudflare R2 Image Optimization Batch Job...\n');

  let ContinuationToken = undefined;
  let totalProcessed = 0;
  let totalSkipped = 0;
  let totalSavedBytes = 0;

  do {
    const listCmd = new ListObjectsV2Command({
      Bucket: BUCKET,
      ContinuationToken,
    });

    const response = await r2.send(listCmd);
    const objects = response.Contents || [];

    for (const obj of objects) {
      const key = obj.Key;

      // Skip already optimized variants
      if (key.endsWith('_sm.webp') || key.endsWith('_md.webp') || key.endsWith('_lg.webp') || key.endsWith('.webp')) {
        totalSkipped++;
        continue;
      }

      // Check if file is an image
      const extMatch = key.match(/\.(png|jpe?g)$/i);
      if (!extMatch) {
        totalSkipped++;
        continue;
      }

      console.log(`📸 Processing: "${key}" (${(obj.Size / 1024 / 1024).toFixed(2)} MB)`);

      try {
        // 1. Download original object
        const getCmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
        const getRes = await r2.send(getCmd);
        const originalBuffer = await streamToBuffer(getRes.Body);

        const baseKey = key.substring(0, key.lastIndexOf('.'));
        const originalExt = extMatch[1].toLowerCase();

        // 2. Generate WebP Variants using Sharp
        const image = sharp(originalBuffer);
        const metadata = await image.metadata();

        // Small variant (max width 480px)
        const smWebp = await sharp(originalBuffer)
          .resize({ width: Math.min(metadata.width || 480, 480), withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();

        // Medium variant (max width 960px)
        const mdWebp = await sharp(originalBuffer)
          .resize({ width: Math.min(metadata.width || 960, 960), withoutEnlargement: true })
          .webp({ quality: 82 })
          .toBuffer();

        // Large variant (max width 1600px)
        const lgWebp = await sharp(originalBuffer)
          .resize({ width: Math.min(metadata.width || 1600, 1600), withoutEnlargement: true })
          .webp({ quality: 84 })
          .toBuffer();

        // Default WebP (same as lgWebp)
        const defaultWebp = lgWebp;

        // Compress original format fallback as well
        let compressedOriginal = originalBuffer;
        if (originalExt === 'png') {
          compressedOriginal = await sharp(originalBuffer)
            .png({ compressionLevel: 8, palette: true })
            .toBuffer();
        } else {
          compressedOriginal = await sharp(originalBuffer)
            .jpeg({ quality: 82, progressive: true })
            .toBuffer();
        }

        const cacheControl = 'public, max-age=31536000, immutable';

        // 3. Upload all variants to R2 with long-term cache headers
        const uploads = [
          // Original key (compressed fallback)
          r2.send(new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: compressedOriginal,
            ContentType: originalExt === 'png' ? 'image/png' : 'image/jpeg',
            CacheControl: cacheControl,
          })),
          // Default .webp variant
          r2.send(new PutObjectCommand({
            Bucket: BUCKET,
            Key: `${baseKey}.webp`,
            Body: defaultWebp,
            ContentType: 'image/webp',
            CacheControl: cacheControl,
          })),
          // _sm.webp
          r2.send(new PutObjectCommand({
            Bucket: BUCKET,
            Key: `${baseKey}_sm.webp`,
            Body: smWebp,
            ContentType: 'image/webp',
            CacheControl: cacheControl,
          })),
          // _md.webp
          r2.send(new PutObjectCommand({
            Bucket: BUCKET,
            Key: `${baseKey}_md.webp`,
            Body: mdWebp,
            ContentType: 'image/webp',
            CacheControl: cacheControl,
          })),
          // _lg.webp
          r2.send(new PutObjectCommand({
            Bucket: BUCKET,
            Key: `${baseKey}_lg.webp`,
            Body: lgWebp,
            ContentType: 'image/webp',
            CacheControl: cacheControl,
          })),
        ];

        await Promise.all(uploads);

        const saved = obj.Size - smWebp.length;
        totalSavedBytes += saved;
        totalProcessed++;

        console.log(`   ✅ Original (${(obj.Size / 1024).toFixed(0)}KB) → WebP Sm: ${(smWebp.length / 1024).toFixed(0)}KB | Md: ${(mdWebp.length / 1024).toFixed(0)}KB | Lg: ${(lgWebp.length / 1024).toFixed(0)}KB`);

      } catch (err) {
        console.error(`   ❌ Failed to process ${key}:`, err.message);
      }
    }

    ContinuationToken = response.NextContinuationToken;
  } while (ContinuationToken);

  console.log('\n════════════════════════════════════════════════════════════');
  console.log(`🎉 Optimization Complete!`);
  console.log(`   Processed: ${totalProcessed} images`);
  console.log(`   Skipped:   ${totalSkipped} files/variants`);
  console.log(`   Estimated Bandwidth Savings on Mobile: ~${(totalSavedBytes / 1024 / 1024).toFixed(2)} MB per full page load`);
  console.log('════════════════════════════════════════════════════════════\n');
}

processAllImages();
