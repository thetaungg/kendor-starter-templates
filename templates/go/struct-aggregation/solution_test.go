package kendor

import (
	"reflect"
	"testing"
)

func sample() []Person {
	return []Person{
		{"Ada", "London", 36},
		{"Lin", "London", 40},
		{"Sam", "Oslo", 20},
	}
}

func TestGroupByCity(t *testing.T) {
	got := GroupByCity(sample())
	want := map[string][]Person{
		"London": {{"Ada", "London", 36}, {"Lin", "London", 40}},
		"Oslo":   {{"Sam", "Oslo", 20}},
	}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("GroupByCity = %v, want %v", got, want)
	}
}

func TestAverageAgeByCity(t *testing.T) {
	got := AverageAgeByCity(sample())
	want := map[string]float64{"London": 38, "Oslo": 20}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("AverageAgeByCity = %v, want %v", got, want)
	}
}
