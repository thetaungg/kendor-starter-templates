# Worker Pool

Implement a bounded worker pool in `solution.go` (package `main`).

## Requirements

- `Process(jobs []int, workers int, fn func(int) int) []int` — apply `fn` to every element of `jobs`
  using at most `workers` concurrent goroutines, and return the results in the **same order as the
  input**. Treat `workers < 1` as `1`.

The work must actually run concurrently (share the jobs across goroutines), but the returned slice
must be deterministic and index-aligned with `jobs`.

## Example

```go
Process([]int{1, 2, 3, 4}, 2, func(n int) int { return n * n }) // [1 4 9 16]
```

Only `solution.go` is editable. Run the tests to check your work.
