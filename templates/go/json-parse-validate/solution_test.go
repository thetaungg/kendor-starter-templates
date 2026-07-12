package main

import "testing"

func TestParseUserValid(t *testing.T) {
	u, err := ParseUser([]byte(`{"name":"Ada","age":36}`))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if u.Name != "Ada" || u.Age != 36 {
		t.Fatalf("got %+v, want {Ada 36}", u)
	}
}

func TestParseUserEmptyName(t *testing.T) {
	if _, err := ParseUser([]byte(`{"name":"","age":1}`)); err == nil {
		t.Fatal("expected an error for an empty name")
	}
}

func TestParseUserNegativeAge(t *testing.T) {
	if _, err := ParseUser([]byte(`{"name":"Ada","age":-1}`)); err == nil {
		t.Fatal("expected an error for a negative age")
	}
}

func TestParseUserMalformed(t *testing.T) {
	if _, err := ParseUser([]byte(`{bad json`)); err == nil {
		t.Fatal("expected an error for malformed JSON")
	}
}
