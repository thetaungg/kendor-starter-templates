# Parse & Validate CSV

Parse simple CSV text and filter it in `Solution.php` (plain global functions).

## Requirements

- `parse_csv(string $text): array` — the first non-empty line is the header row; return a list of
  associative arrays (header → cell) for each data row. Blank lines are skipped and every cell is
  trimmed. Returns `[]` when there are no data rows.
- `filter_valid(array $rows, array $required): array` — keep only the rows where every key in
  `$required` is present and non-empty. Re-index the result from `0`.

## Example

```php
$rows = parse_csv("name, email\nAda, ada@x.com\nLin,");
// [['name' => 'Ada', 'email' => 'ada@x.com'], ['name' => 'Lin', 'email' => '']]
filter_valid($rows, ['name', 'email']);
// [['name' => 'Ada', 'email' => 'ada@x.com']]
```

Only `Solution.php` is editable. Run the tests to check your work.
