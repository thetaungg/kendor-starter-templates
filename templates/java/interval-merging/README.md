# Interval Merging

Implement two interval helpers in `Solution.java`. An interval is an `int[]` of `{start, end}` with
`start <= end`.

## Requirements

- `List<int[]> merge(List<int[]> intervals)` — merge every overlapping interval and return the result
  sorted by start. Intervals that touch (`{1, 3}` and `{3, 5}`) count as overlapping. The input may be
  in any order; don't modify it. Return an empty list for empty input.
- `int coveredLength(List<int[]> intervals)` — the total length the intervals cover once merged
  (`end - start` summed over the merged intervals).

## Example

```java
merge(List.of(new int[] {8, 10}, new int[] {1, 3}, new int[] {2, 6}))  // [[1, 6], [8, 10]]
coveredLength(List.of(new int[] {1, 3}, new int[] {2, 6}))             // 5
```

Only `Solution.java` is editable. Run the tests to check your work.
