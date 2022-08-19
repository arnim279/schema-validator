import { describe, expect, it } from "vitest";
import { findTypeError } from "../findTypeError.js";
import { schema } from "../index.js";

describe("findTypeError", () => {
  let schema: schema;

  it("validates number types", () => {
    schema = "float";
    expect(findTypeError(1, schema)).eq(undefined);
    expect(findTypeError("", schema)).not.eq(undefined);
  });

  it("validates boolean types", () => {
    schema = "bool";
    expect(findTypeError(true, schema)).eq(undefined);
    expect(findTypeError(1, schema)).not.eq(undefined);
  });

  it("validates string types", () => {
    schema = "string";
    expect(findTypeError("", schema)).eq(undefined);
  });

  it("validates int types", () => {
    schema = "int";
    expect(findTypeError(1, schema)).eq(undefined);
    expect(findTypeError(0.5, schema)).not.eq(undefined);
    expect(findTypeError("", schema)).not.eq(undefined);
  });

  it("works with arrays", () => {
    schema = ["int"];
    expect(findTypeError(1, schema)).not.eq(undefined);
    expect(findTypeError([0, 1, 2], schema)).eq(undefined);
  });

  it("checks all elements in an array", () => {
    schema = ["int"];
    expect(findTypeError([0, 1, 2], schema)).eq(undefined);
    expect(findTypeError([-1, 0, 1, 2, true], schema)).not.eq(undefined);
  });

  it("works with objects", () => {
    schema = {
      type: "object",
      properties: {
        a: "bool",
        b: ["int"],
        c: {
          type: "object",
          properties: { d: { type: "string", optional: true } },
        },
      },
    };
    expect(findTypeError({ a: false, b: [1], c: { d: "" } }, schema)).eq(
      undefined
    );
    expect(findTypeError({ a: false, b: [1], c: {} }, schema)).eq(undefined);
  });

  it("works with custom validators", () => {
    schema = {
      type: "float",
      validator: (n) => n === 42 || "number must be 42",
    };
    expect(findTypeError(1, schema)).not.eq(undefined);
    expect(findTypeError(42, schema)).eq(undefined);
  });
});
