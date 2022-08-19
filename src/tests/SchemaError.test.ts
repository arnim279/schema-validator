import { assert, describe, it } from "vitest";
import { findSchemaError, schema, SchemaErrorType } from "..";

describe("SchemaError.only()", () => {
  let schema: schema = {
    type: "object",
    properties: {
      a: "string",
      b: {
        type: "bool",
        validator: (v) => v === true || "must be true",
      },
    },
  };

  it("only lists each schema error type once", () => {
    assert.isTrue(
      findSchemaError({}, schema)?.only(SchemaErrorType.MissingProperty)
    );
  });

  it("finds all occuring schema error types", () => {
    assert.isTrue(
      findSchemaError({ a: 1, b: false, c: 0 }, schema)?.only(
        SchemaErrorType.WrongType,
        SchemaErrorType.UnknownProperty,
        SchemaErrorType.ValidatorFailed
      )
    );
  });

  it("detects when there are more error types", () => {
    assert.isFalse(
      findSchemaError({ a: 1, b: false, c: 0 }, schema)?.only(
        SchemaErrorType.WrongType
      )
    );
  });
});
