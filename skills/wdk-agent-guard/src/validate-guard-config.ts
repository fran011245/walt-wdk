/**
 * Validate `config.guard` using JSON Schema (Ajv).
 * Copyright 2026 WaltWDK Contributors. Licensed under Apache-2.0.
 */

import { Ajv, type ErrorObject } from 'ajv';
import { guardConfigSchema } from './guard-config-schema.js';

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(guardConfigSchema);

function formatErrors(errors: ErrorObject[] | null | undefined): string {
  if (!errors?.length) return 'unknown validation error';
  return errors.map((e) => `${e.instancePath || '(root)'} ${e.message ?? ''}`.trim()).join('; ');
}

/** Throws with a clear message if `guard` does not match the schema. */
export function assertValidGuardConfig(guard: unknown): void {
  if (guard == null) return;
  if (typeof guard !== 'object' || Array.isArray(guard)) {
    throw new Error('Invalid guard config: expected an object or omit the key.');
  }
  const ok = validate(guard);
  if (!ok) {
    throw new Error(`Invalid guard config: ${formatErrors(validate.errors)}`);
  }
}
