# Struct Aggregation

Aggregate a slice of `Person` values in `solution.go` (package `kendor`).

The `Person` type is already declared:

```go
type Person struct {
	Name string
	City string
	Age  int
}
```

## Requirements

- `GroupByCity(people []Person) map[string][]Person` — group people by their `City`, preserving input
  order within each group.
- `AverageAgeByCity(people []Person) map[string]float64` — the mean `Age` per city.

## Example

```go
people := []Person{{"Ada", "London", 36}, {"Lin", "London", 40}, {"Sam", "Oslo", 20}}
AverageAgeByCity(people) // map[London:38 Oslo:20]
```

Only `solution.go` is editable. Run the tests to check your work.
