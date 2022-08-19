import { SchemaErrorType, typeError } from "./findTypeError.js";

/**
 * SchemaError is a wrapper around the {@link typeError} type.
 */
export class SchemaError {
  readonly typeError;

  /**
   * Creates a new SchemaError.
   * @param error the typeError
   */
  constructor(error: typeError) {
    this.typeError = error;
  }

  /**
   * Finds all {@link SchemaErrorType} that occur in this typeError.
   * @returns a list that includes all occuring schema error types once.
   */
  private uniqueErrorTypes(): SchemaErrorType[] {
    let t: SchemaErrorType[] = [];
    if (this.typeError.error) t.push(this.typeError.error.type);

    return Object.values(this.typeError.properties || {})
      .map((p) => new SchemaError(p).uniqueErrorTypes())
      .flat()
      .reduce((list, err) => {
        if (!list.includes(err)) list.push(err);
        return list;
      }, t);
  }

  /**
   * Checks if the SchemaError only has a specific set of occuring error types.
   *
   * Usage:
   * ```ts
   * let err = a; // has SchemaErrorType.UnknownProperty
   * err.only(SchemaErrorType.UnknownProperty); // true
   *
   * err.only(
   *  SchemaErrorType.UnknownProperty,
   *  SchemaErrorType.MissingProperty
   * ); // true
   *
   * err.only(); // false
   *
   *
   * ```
   * @param t the error types to check for
   * @returns whether t covers all occuring error types.
   */
  only(...t: SchemaErrorType[]): boolean {
    let input: SchemaErrorType[] = [];
    for (let e of t) {
      if (!input.includes(e)) input.push(e);
    }

    let errorTypes = this.uniqueErrorTypes();
    return (
      input.length >= errorTypes.length &&
      input.every((e) => errorTypes.includes(e))
    );
  }

  /**
   * Formats the SchemaError into a format that can be returned as e.g. an API response,
   * i.e. the ErrorType is removed.
   * @returns the formatted error object
   */
  toJSON(): JSONTypeError {
    let j: JSONTypeError = {};

    if (this.typeError.error) j.message = this.typeError.error.message;
    for (let [p, v] of Object.entries(this.typeError.properties || {})) {
      j.properties ||= {};
      j.properties[p] = new SchemaError(v).toJSON();
    }

    return j;
  }
}

type JSONTypeError = {
  message?: string;
  properties?: Record<string, JSONTypeError>;
};
