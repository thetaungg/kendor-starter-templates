package main

// User is the record to parse. Do not change this type.
type User struct {
	Name string `json:"name"`
	Age  int    `json:"age"`
}

// ParseUser unmarshals and validates a user record. Only this file is editable by the candidate.
func ParseUser(data []byte) (User, error) {
	// TODO: implement
	return User{}, nil
}

func main() {}
