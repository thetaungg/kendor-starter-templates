package kendor

// Reference solution — stripped from the candidate seed (kendor.solutionDir).

type Person struct {
	Name string
	City string
	Age  int
}

func GroupByCity(people []Person) map[string][]Person {
	out := map[string][]Person{}
	for _, p := range people {
		out[p.City] = append(out[p.City], p)
	}
	return out
}

func AverageAgeByCity(people []Person) map[string]float64 {
	sum := map[string]int{}
	count := map[string]int{}
	for _, p := range people {
		sum[p.City] += p.Age
		count[p.City]++
	}
	out := map[string]float64{}
	for city, total := range sum {
		out[city] = float64(total) / float64(count[city])
	}
	return out
}
