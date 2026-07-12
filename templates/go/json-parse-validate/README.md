# Parse & Validate JSON

Parse a JSON user record and validate it in `solution.go` (package `main`).

The `User` type is already declared:

```go
type User struct {
	Name string `json:"name"`
	Age  int    `json:"age"`
}
```

## Requirements

- `ParseUser(data []byte) (User, error)` — unmarshal `data` into a `User` and validate it:
  - Return the unmarshal error if the JSON is malformed.
  - Return an error if `name` is empty.
  - Return an error if `age` is negative.
  - Otherwise return the populated `User` and a `nil` error.

## Example

```go
ParseUser([]byte(`{"name":"Ada","age":36}`)) // User{Ada 36}, nil
ParseUser([]byte(`{"name":"","age":1}`))     // User{}, error
ParseUser([]byte(`{bad json`))               // User{}, error
```

Only `solution.go` is editable. Run the tests to check your work.
