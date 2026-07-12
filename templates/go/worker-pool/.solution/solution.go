package main

import "sync"

// Reference solution — stripped from the candidate seed (kendor.solutionDir).

func Process(jobs []int, workers int, fn func(int) int) []int {
	if workers < 1 {
		workers = 1
	}
	results := make([]int, len(jobs))

	type task struct{ idx, val int }
	ch := make(chan task)

	var wg sync.WaitGroup
	for w := 0; w < workers; w++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			// Each worker writes to a distinct index, so no lock is needed.
			for t := range ch {
				results[t.idx] = fn(t.val)
			}
		}()
	}

	for i, v := range jobs {
		ch <- task{idx: i, val: v}
	}
	close(ch)
	wg.Wait()

	return results
}

func main() {}
