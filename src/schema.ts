/**
 * Schema representing a primitive  data type.
 */
type primitive = "null" | "int" | "bool" | "float" | "string" | "unknown";

type baseSchema<t extends string> = {
  type: t;

  /**
   * A custom validator for a schema.
   * @param v the value to check. Its type is checked before this validator is called
   * @returns true if the validation succeeds, otherwise an error message
   */
  validator?(v: unknown): true | string;
};

/**
 * A Schema representing an array.
 */
interface arraySchema extends baseSchema<"array"> {
  children: schema;
}

/**
 * Schema representing an object.
 */
interface objectSchema extends baseSchema<"object"> {
  properties: Record<string, objectSchemaProperty<schema>>;
}

type objectSchemaProperty<t extends schema> = t extends baseSchema<string>
  ? t & {
      /**
       * Whether the property is optional. Defaults to false.
       */
      optional?: boolean;
    }
  : t;

/**
 * A schema representing a union of two types.
 */
interface unionSchema extends baseSchema<"union"> {
  types: schema[];
}

/**
 * Represents a schema.
 *
 * Usage:
 *
 * ```ts
 * // primitive data type
 * let a: schema = "string"
 * // equivalent to:
 * let a: schema = {type: "string"}
 *
 * // object
 * let a: schema = {
 *  type: "object",
 *  properties: {
 *    a: "int",
 *    b: {type: "bool", optional: true}
 *  }
 * }
 *
 * // arrays
 * let a: schema = ["float"]
 * // equivalent to:
 * let a: schema = {
 *  type: "array",
 *  children: "float"
 * }
 *
 * // union types:
 * let a: schema = {
 *  type: "union",
 *  types: ["string", "null"]
 * }
 * ```
 */
export type schema =
  | primitive
  | baseSchema<primitive>
  | [schema]
  | arraySchema
  | objectSchema
  | unionSchema;
