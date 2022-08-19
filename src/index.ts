export { SchemaErrorType } from "./findTypeError.js";
export type { schema } from "./schema.js";
export type { SchemaError } from "./SchemaError.js";

import { findTypeError } from "./findTypeError.js";
import { schema } from "./schema.js";
import { SchemaError } from "./SchemaError.js";

/**
 * Checks if a value follows a specific schema.
 * @param d the value to check
 * @param s the schema that d should follow
 * @returns {@link SchemaError} if the values does not match the schema
 */
export function findSchemaError(d: unknown, s: schema) {
  let e = findTypeError(d, s);
  return e ? new SchemaError(e) : e;
}
