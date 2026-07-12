# Slice & Map Manipulation

Implement three small slice/map helpers in `solution.go` (package `kendor`).

## Requirements

- `Unique(nums []int) []int` — return the ints with duplicates removed, preserving first-seen order.
  Return an empty (non-nil) slice for empty input.
- `GroupByParity(nums []int) map[string][]int` — bucket the ints under keys `"even"` and `"odd"`.
- `SumInts(nums []int) int` — return the sum of the ints.

## Example

```go
Unique([]int{1, 1, 2, 3, 3})          // [1 2 3]
GroupByParity([]int{1, 2, 3, 4})       // map[even:[2 4] odd:[1 3]]
SumInts([]int{1, 2, 3})                // 6
```

Only `solution.go` is editable. Run the tests to check your work.
