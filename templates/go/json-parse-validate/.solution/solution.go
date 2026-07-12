package main

import (
	"encoding/json"
	"errors"
)

// Reference solution — stripped from the candidate seed (kendor.solutionDir).

type User struct {
	Name string `json:"name"`
	Age  int    `json:"age"`
}

func ParseUser(data []byte) (User, error) {
	var u User
	if err := json.Unmarshal(data, &u); err != nil {
		return User{}, err
	}
	if u.Name == "" {
		return User{}, errors.New("name is required")
	}
	if u.Age < 0 {
		return User{}, errors.New("age must not be negative")
	}
	return u, nil
}

func main() {}
