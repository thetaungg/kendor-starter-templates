package indexer

import (
	"reflect"
	"testing"
)

func TestBuildIndexesEachTermOnce(t *testing.T) {
	index := Build([]string{"Rust and Go", "go GO go"})

	if !reflect.DeepEqual(index["go"], []int{0, 1}) {
		t.Fatalf("index[go] = %v, want [0 1]", index["go"])
	}
}

func TestBuildIgnoresPunctuation(t *testing.T) {
	index := Build([]string{"hello, world!"})

	if len(index) != 2 {
		t.Fatalf("got %d terms, want 2", len(index))
	}
}
