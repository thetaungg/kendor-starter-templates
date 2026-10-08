package main

import (
	"testing"
	"time"
)

func TestStartsFullThenEmpties(t *testing.T) {
	b := NewBucket(2, time.Second)
	t0 := time.Unix(0, 0)
	if !b.AllowAt(t0) {
		t.Fatal("call 1 should be allowed")
	}
	if !b.AllowAt(t0) {
		t.Fatal("call 2 should be allowed")
	}
	if b.AllowAt(t0) {
		t.Fatal("call 3 should be denied (bucket empty)")
	}
}

func TestRefillsOverTime(t *testing.T) {
	b := NewBucket(2, time.Second)
	t0 := time.Unix(0, 0)
	b.AllowAt(t0)
	b.AllowAt(t0) // empty now
	if !b.AllowAt(t0.Add(time.Second)) {
		t.Fatal("one token should have refilled after 1s")
	}
	if b.AllowAt(t0.Add(time.Second)) {
		t.Fatal("only one token should have refilled")
	}
}

func TestRefillCapsAtCapacity(t *testing.T) {
	b := NewBucket(2, time.Second)
	t0 := time.Unix(0, 0)
	b.AllowAt(t0)
	b.AllowAt(t0) // empty
	// Wait a long time — refill must cap at capacity (2), not accumulate unbounded.
	far := t0.Add(10 * time.Second)
	if !b.AllowAt(far) {
		t.Fatal("token 1 after long wait")
	}
	if !b.AllowAt(far) {
		t.Fatal("token 2 after long wait")
	}
	if b.AllowAt(far) {
		t.Fatal("bucket must cap at capacity 2")
	}
}
