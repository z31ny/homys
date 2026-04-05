import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Validates request body against a Zod schema.
 * Returns 400 with detailed validation errors if invalid.
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues ?? [];
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: issues.map((issue) => ({
            field: issue.path.map(String).join('.'),
            message: issue.message,
          })),
        });
      }
      next(error);
    }
  };
};
