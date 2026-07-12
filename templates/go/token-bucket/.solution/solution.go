package main

import "time"

// Reference solution — stripped from the candidate seed (kendor.solutionDir).

type Bucket struct {
	capacity int
	refill   time.Duration
	tokens   int
	last     time.Time
	started  bool
}

func NewBucket(capacity int, refill time.Duration) *Bucket {
	return &Bucket{capacity: capacity, refill: refill, tokens: capacity}
}

func (b *Bucket) AllowAt(now time.Time) bool {
	if !b.started {
		b.last = now
		b.started = true
	}
	if b.refill > 0 {
		if elapsed := now.Sub(b.last); elapsed > 0 {
			if add := int(elapsed / b.refill); add > 0 {
				b.tokens += add
				if b.tokens > b.capacity {
					b.tokens = b.capacity
				}
				b.last = b.last.Add(time.Duration(add) * b.refill)
			}
		}
	}
	if b.tokens > 0 {
		b.tokens--
		return true
	}
	return false
}

func main() {}
