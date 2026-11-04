import { z } from 'zod';
import { DEVICE_CATEGORIES } from '../../shared/telemetry.js';

const keySchema = z
  .string()
  .trim()
  .min(8)
  .max(128)
  .regex(/^[A-Za-z0-9_-]+$/);

const optionalLabel = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .optional();

export const sessionPayloadSchema = z.object({
  sessionKey: keySchema,
  visitorKey: keySchema,
  browserName: optionalLabel,
  browserEngine: optionalLabel,
  deviceCategory: z.enum(DEVICE_CATEGORIES).optional(),
  osName: optionalLabel,
  screenWidth: z.number().int().positive().max(16384).optional(),
  screenHeight: z.number().int().positive().max(16384).optional(),
  timezone: z.string().trim().min(1).max(64).optional(),
  userAgent: z.string().trim().min(1).max(512).optional(),
});

export const heartbeatPayloadSchema = z.object({
  sessionKey: keySchema,
});

export const endPayloadSchema = z.object({
  sessionKey: keySchema,
});

export const watchPayloadSchema = z.object({
  watcherKey: keySchema,
});

export function parseJsonBody(raw: unknown): unknown {
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as unknown;
    } catch {
      return null;
    }
  }

  return raw;
}
