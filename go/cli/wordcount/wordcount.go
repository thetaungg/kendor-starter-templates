// Package wordcount counts how often each word appears in a text.
package wordcount

import "strings"

// Count returns the occurrences of each lower-cased, whitespace-separated word.
func Count(text string) map[string]int {
	counts := map[string]int{}

	for _, word := range strings.Fields(strings.ToLower(text)) {
		counts[word]++
	}

	return counts
}
