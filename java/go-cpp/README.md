# Java + Go + C++ project

Three services in one sandbox, each in its own folder and language:

| Folder | Language | What it does | Runs |
| --- | --- | --- | --- |
| `api/` | Java (Spring Boot) | Web API, shown in the preview | Starts by itself |
| `indexer/` | Go | Builds an index of words → documents | Tests only |
| `engine/` | C++ (CMake) | Ranks documents by matches | Tests only |

## Run it

The API is already running in the `api` terminal tab. It doesn't reload on save. To restart it, click
the `api` tab, press Ctrl+C, then press ↑ and Enter. Try `/api/hello?name=Ada` in the preview.

## Test it

Open a new terminal with **+**, then run the tests for the part you changed:

```bash
cd api && mvn -q test                                  # Java
cd indexer && go test ./...                            # Go
cd engine && cmake --build build && ./build/tests      # C++ (compiles first)
```

Clicking **Run tests** in the Tests view runs all three, which is what grading does.

## Files

- `api/src/main/java/com/example/demo/GreetingController.java`: the API routes.
- `indexer/indexer.go`: the Go index builder.
- `engine/src/ranking.cpp`: the C++ ranking (`ranking.hpp` declares it).
- Each folder keeps its tests next to its code (`api/src/test`, `indexer/*_test.go`, `engine/tests`).
