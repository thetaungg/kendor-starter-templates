# String Tokenize & Slugify

Implement two string helpers in `solution.js`.

## Requirements

- `tokenize(text)` — return the lowercase word tokens of `text`, where a token is a maximal run of
  letters/digits (`[a-z0-9]+`). Everything else is a separator. Returns `[]` when there are no
  tokens.
- `slugify(text)` — return a URL slug: lowercase, every run of non-alphanumeric characters collapsed
  to a single `-`, with no leading or trailing `-`.

## Example

```js
tokenize('Hello, World! 123'); // ['hello', 'world', '123']
slugify('  Hello, World!  ');  // 'hello-world'
```

Only `solution.js` is editable. Run the tests to check your work.
