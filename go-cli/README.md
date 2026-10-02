# Go command-line app

A small Go program that counts words in the text you give it. There is no web page, so the preview
stays empty. You run the program in a terminal.

## Run it

Open a new terminal with **+** in the terminal bar, then:

```bash
go run . the cat and the hat
```

`go run` compiles and runs in one step, so it always uses your latest code.

## Test it

```bash
go test ./...
```

Or click **Run tests** in the Tests view. That runs the same tests used for grading.

## Files

- `wordcount/wordcount.go` is the code to work on.
- `wordcount/wordcount_test.go` holds the tests.
- `main.go` reads the arguments and prints the result.
