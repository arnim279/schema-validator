export { SchemaErrorType } from "./findTypeError";
export type { schema } from "./schema";
export type { SchemaError } from "./SchemaError";

import { findTypeError } from "./findTypeError";
import { schema } from "./schema";
import { SchemaError } from "./SchemaError";

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
