# Array & Collection Helpers

Implement three collection helpers in `Solution.php` (plain global functions).

## Requirements

- `pluck(array $rows, string $key): array` — extract the value at `$key` from each associative row.
- `sum_by(array $rows, string $key): float|int` — sum the `$key` value across all rows (`0` when
  empty).
- `group_by(array $rows, string $key): array` — group rows into a map keyed by their `$key` value,
  preserving order within each group.

## Example

```php
$rows = [['team' => 'a', 'pts' => 3], ['team' => 'b', 'pts' => 5], ['team' => 'a', 'pts' => 2]];
pluck($rows, 'team');    // ['a', 'b', 'a']
sum_by($rows, 'pts');    // 10
group_by($rows, 'team'); // ['a' => [...2 rows], 'b' => [...1 row]]
```

Only `Solution.php` is editable. Run the tests to check your work.
