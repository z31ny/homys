import { Request, Response, NextFunction } from 'express';
import { createPresignedUpload, deleteR2Object, R2_PUBLIC_URL } from '../_config/r2';
import { AppError } from '../_middleware/errorHandler';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'application/pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * POST /api/uploads/presign
 * Returns a presigned PUT URL for direct browser → R2 upload.
 * Body: { filename: string, contentType: string, folder?: string }
 */
export const getPresignedUrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Not authenticated.', 401);

    const { filename, contentType, folder } = req.body;

    if (!filename || !contentType) {
      throw new AppError('filename and contentType are required.', 400);
    }

    if (!ALLOWED_TYPES.includes(contentType)) {
      throw new AppError(`File type "${contentType}" is not allowed.`, 400);
    }

    const uploadFolder = folder || 'general';

    const result = await createPresignedUpload({
      folder: uploadFolder,
      filename,
      contentType,
    });

    res.json({
      status: 'success',
      data: {
        uploadUrl: result.uploadUrl,
        key: result.key,
        publicUrl: result.publicUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/uploads/:key(*)
 * Deletes an object from R2 by its full key path.
 */
export const deleteUpload = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Not authenticated.', 401);

    // Express 5: params can be string | string[]
    const key = Array.isArray(req.params.key) ? req.params.key.join('/') : (req.params.key as string);

    if (!key) throw new AppError('Object key is required.', 400);

    await deleteR2Object(key);

    res.json({ status: 'success', message: 'File deleted.' });
  } catch (error) {
    next(error);
  }
};
