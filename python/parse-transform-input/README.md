# Parse & Transform Input

Parse simple CSV text and summarize it in `solution.py`.

## Requirements

- `parse_csv(text)` — given CSV text whose first non-empty line is the header row, return a list of
  dicts (one per data row) mapping header → cell value (all strings). Blank lines are ignored and
  cells are trimmed of surrounding whitespace. Returns `[]` when there are no data rows.
- `sum_column(rows, column)` — return the numeric sum of `column` across `rows` (values parsed as
  floats).

## Example

```python
rows = parse_csv("name, amount\\nada, 3\\nlin, 4.5")
# [{"name": "ada", "amount": "3"}, {"name": "lin", "amount": "4.5"}]
sum_column(rows, "amount")   # 7.5
```

Only `solution.py` is editable. Run the tests to check your work.
