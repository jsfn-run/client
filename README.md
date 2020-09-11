# Node Lambdas Client

## Usage

```typescript
// JSON to YAML to JSON
// Same as running:
// > echo '{"number": 1}' | fn yaml encode | fn yaml decode
const json = JSON.stringify({ number: 'one' });
const input = new Blob([json], { type: 'application/json' });
const response = await pipe(input, { name: 'yaml', action: 'encode' }, { name: 'yaml', action: 'decode' });

// output { "number": 1 }
console.log(response);
```
