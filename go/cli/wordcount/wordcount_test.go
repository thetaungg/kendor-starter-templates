package wordcount

import "testing"

func TestCountIgnoresCase(t *testing.T) {
	got := Count("Go go GO")

	if got["go"] != 3 {
		t.Fatalf(`Count("Go go GO")["go"] = %d, want 3`, got["go"])
	}
}

func TestCountEmptyText(t *testing.T) {
	if got := Count(""); len(got) != 0 {
		t.Fatalf("Count(\"\") = %v, want empty", got)
	}
}
