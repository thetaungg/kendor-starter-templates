package main

import (
	"reflect"
	"testing"
)

func TestUniquePreservesOrder(t *testing.T) {
	got := Unique([]int{1, 1, 2, 3, 3, 2})
	want := []int{1, 2, 3}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("Unique = %v, want %v", got, want)
	}
}

func TestUniqueEmpty(t *testing.T) {
	got := Unique([]int{})
	if len(got) != 0 {
		t.Fatalf("Unique([]) = %v, want empty", got)
	}
}

func TestGroupByParity(t *testing.T) {
	got := GroupByParity([]int{1, 2, 3, 4})
	want := map[string][]int{"odd": {1, 3}, "even": {2, 4}}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("GroupByParity = %v, want %v", got, want)
	}
}

func TestSumInts(t *testing.T) {
	if got := SumInts([]int{1, 2, 3, 4}); got != 10 {
		t.Fatalf("SumInts = %d, want 10", got)
	}
}
