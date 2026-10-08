// Package indexer splits documents into terms and builds an inverted index.
package indexer

import (
	"sort"
	"strings"
	"unicode"
)

// Index maps each lowercased term to the sorted ids of the documents that contain it.
type Index map[string][]int

// Build indexes docs by position (the first document has id 0).
func Build(docs []string) Index {
	index := Index{}

	for id, doc := range docs {
		seen := map[string]bool{}

		for _, term := range strings.FieldsFunc(strings.ToLower(doc), isSeparator) {
			if seen[term] {
				continue
			}

			seen[term] = true
			index[term] = append(index[term], id)
		}
	}

	for term := range index {
		sort.Ints(index[term])
	}

	return index
}

func isSeparator(r rune) bool {
	return !unicode.IsLetter(r) && !unicode.IsDigit(r)
}
