# Token-Bucket Rate Limiter

Implement a deterministic token-bucket rate limiter in `solution.go` (package `kendor`).

The clock is passed in explicitly (`AllowAt(now)`) so behaviour is fully testable without real time.

## Requirements

- `NewBucket(capacity int, refill time.Duration) *Bucket` — a bucket that starts **full** with
  `capacity` tokens and gains one token every `refill` interval, never exceeding `capacity`.
- `(*Bucket) AllowAt(now time.Time) bool` — refill based on the time elapsed since the last call, then
  consume one token: return `true` and decrement if a token is available, otherwise `false`. The
  first call establishes the bucket's start time.

## Example

```go
b := NewBucket(2, time.Second)
t0 := time.Now()
b.AllowAt(t0)                     // true  (2 -> 1)
b.AllowAt(t0)                     // true  (1 -> 0)
b.AllowAt(t0)                     // false (empty)
b.AllowAt(t0.Add(time.Second))    // true  (refilled 1)
```

Only `solution.go` is editable. Run the tests to check your work.
