import { schema } from "./schema";

export enum SchemaErrorType {
  UnknownProperty,
  MissingProperty,
  WrongType,
  ValidatorFailed,
  NoApplicableUnionType,
}

export type typeError = {
  error?: {
    type: SchemaErrorType;
    message: string;
  };
  properties?: Record<string, typeError>;
};

export function findTypeError(
  d: unknown,
  schema: schema
): typeError | undefined {
  if (typeof schema === "string") {
    return findTypeError(d, { type: schema });
  } else if (Array.isArray(schema)) {
    return findTypeError(d, { type: "array", children: schema[0] });
  }

  let e: typeError = {};
  switch (schema.type) {
    case "null": {
      if (d !== null) {
        e.error = {
          type: SchemaErrorType.WrongType,
          message: "expected null",
        };
      }
      break;
    }

    case "bool": {
      if (typeof d !== "boolean") {
        e.error = {
          type: SchemaErrorType.WrongType,
          message: "expected bool",
        };
      }
      break;
    }

    case "float": {
      if (typeof d !== "number") {
        e.error = {
          type: SchemaErrorType.WrongType,
          message: "expected float",
        };
      }
      break;
    }

    case "int": {
      if (typeof d !== "number" || d % 1 !== 0) {
        e.error = {
          type: SchemaErrorType.WrongType,
          message: "expected int",
        };
      }
      break;
    }

    case "string": {
      if (typeof d !== "string") {
        e.error = {
          type: SchemaErrorType.WrongType,
          message: "expected string",
        };
      }
      break;
    }

    case "array": {
      if (!Array.isArray(d)) {
        e.error = {
          type: SchemaErrorType.WrongType,
          message: "expected array",
        };
        break;
      }
      // check every item in d
      for (let [k, v] of d.entries()) {
        let propertyError = findTypeError(v, schema.children);
        if (propertyError !== undefined) {
          e.properties ||= {};
          e.properties[k] = propertyError;
        }
      }
      break;
    }

    case "object": {
      // check if d is an object
      if (typeof d !== "object" || Array.isArray(d) || d === null) {
        e.error = {
          type: SchemaErrorType.WrongType,
          message: "expected object",
        };
        break;
      }

      // check all properties of d
      for (let [k, v] of Object.entries(d)) {
        let propertySchema = schema.properties[k];
        if (propertySchema === undefined) {
          e.properties ||= {};
          e.properties[k] = {
            error: {
              type: SchemaErrorType.UnknownProperty,
              message: "property not allowed",
            },
          };
          continue;
        }
        let propertyError = findTypeError(v, propertySchema);
        if (propertyError !== undefined) {
          e.properties ||= {};
          e.properties[k] = propertyError;
        }
      }

      // find any missing properties in d
      for (let [k, propertySchema] of Object.entries(schema.properties)) {
        if (
          (d as any)[k] === undefined &&
          (typeof propertySchema === "string" ||
            Array.isArray(propertySchema) ||
            propertySchema.optional !== true)
        ) {
          e.properties ||= {};
          e.properties[k] = {
            error: {
              type: SchemaErrorType.MissingProperty,
              message: "property missing",
            },
          };
        }
      }
      break;
    }

    case "union": {
      let optionErrors: Record<string, typeError> = {};
      let validOption = false;
      for (let [i, unionSchema] of schema.types.entries()) {
        let err = findTypeError(d, unionSchema);
        if (err === undefined) validOption = true;
        else optionErrors[`type_${i}`] = err;
      }
      if (!validOption) {
        e.error = {
          type: SchemaErrorType.NoApplicableUnionType,
          message: "does not match any type in the union type",
        };
        e.properties = optionErrors;
      }
      break;
    }
  }

  if (e.error || e.properties) {
    return e;
  }

  if (schema.validator) {
    let validatorError = schema.validator(d);
    if (validatorError !== true) {
      e.error = {
        type: SchemaErrorType.ValidatorFailed,
        message: validatorError,
      };
    }
  }

  if (e.error) {
    return e;
  }
}
