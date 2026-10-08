package main

// Reference solution — stripped from the candidate seed (kendor.solutionDir).

func Unique(nums []int) []int {
	seen := make(map[int]bool)
	out := []int{}
	for _, n := range nums {
		if !seen[n] {
			seen[n] = true
			out = append(out, n)
		}
	}
	return out
}

func GroupByParity(nums []int) map[string][]int {
	out := map[string][]int{}
	for _, n := range nums {
		key := "even"
		if n%2 != 0 {
			key = "odd"
		}
		out[key] = append(out[key], n)
	}
	return out
}

func SumInts(nums []int) int {
	total := 0
	for _, n := range nums {
		total += n
	}
	return total
}

func main() {}
