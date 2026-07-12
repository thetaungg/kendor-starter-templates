package kendor

import "testing"

func TestDoublesTwo(t *testing.T) {
	if got := Solve(2); got != 4 {
		t.Fatalf("Solve(2) = %d, want 4", got)
	}
}
