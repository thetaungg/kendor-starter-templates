# C++ command-line app

A small C++ program built with CMake. It reads text and prints how many times each word appears.
There is no web page, so the preview stays empty. You run the program in a terminal.

## Run it

Open a new terminal with **+** in the terminal bar, then:

```bash
cmake --build build                          # compile your changes
echo "the cat and the hat" | ./build/app     # run the program
```

C++ must be compiled again after every edit, otherwise `./build/app` runs the old version.
`cmake --build build` only recompiles the files you changed.

## Test it

```bash
cmake --build build && ./build/tests
```

Or click **Run tests** in the Tests view. That runs the same tests used for grading.

## Files

- `src/wordcount.cpp` is the code to work on (`wordcount.hpp` declares it).
- `src/main.cpp` reads input and prints the result.
- `tests/wordcount_test.cpp` holds the tests (Catch2).
- `CMakeLists.txt` tells CMake what to build. You rarely need to touch it.
