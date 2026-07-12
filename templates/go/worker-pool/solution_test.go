package kendor

import (
	"reflect"
	"sync/atomic"
	"testing"
)

func TestProcessPreservesOrder(t *testing.T) {
	got := Process([]int{1, 2, 3, 4, 5}, 3, func(n int) int { return n * n })
	want := []int{1, 4, 9, 16, 25}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("Process = %v, want %v", got, want)
	}
}

func TestProcessRunsEveryJob(t *testing.T) {
	var count int64
	Process([]int{1, 2, 3, 4, 5, 6}, 4, func(n int) int {
		atomic.AddInt64(&count, 1)
		return n
	})
	if count != 6 {
		t.Fatalf("fn called %d times, want 6", count)
	}
}

func TestProcessSingleWorker(t *testing.T) {
	got := Process([]int{2, 4}, 0, func(n int) int { return n + 1 })
	want := []int{3, 5}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("Process = %v, want %v", got, want)
	}
}
