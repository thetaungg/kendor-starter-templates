package main

import (
	"fmt"
	"os"
	"strings"

	"kendor/wordcount"
)

func main() {
	text := strings.Join(os.Args[1:], " ")

	for word, n := range wordcount.Count(text) {
		fmt.Printf("%s\t%d\n", word, n)
	}
}
