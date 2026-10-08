package main

import "time"

// Bucket is a token-bucket rate limiter with an explicit clock. Only this file is editable.
type Bucket struct {
	capacity int
	refill   time.Duration
	tokens   int
	last     time.Time
	started  bool
}

// NewBucket returns a bucket that starts full.
func NewBucket(capacity int, refill time.Duration) *Bucket {
	// TODO: implement
	return &Bucket{}
}

// AllowAt refills based on elapsed time, then consumes a token if one is available.
func (b *Bucket) AllowAt(now time.Time) bool {
	// TODO: implement
	return false
}

func main() {}
