# Schemavalidator

Yet another schema validator

### Usage example

```ts
import {
  schema,
  SchemaErrorType,
  findSchemaError,
} from "@arnim279/schema-validator";

const mySchema: schema = {
  type: "object",
  properties: {
    a: "string",
    b: "bool",
    c: [
      {
        type: "int",
        validator: (v: number) => v < 100 || "invalid number",
      },
    ],
  },
};

function handleUserInput(data: unknown) {
  let err = findSchemaError(data, mySchema);
  if (err && !err.only(SchemaErrorType.UnknownProperty)) {
    // data has wrong type or properties don't match

    // handle error
    return;
  }

  // you can cast data to {a: string, b: boolean, c: number[]} here
}
```
