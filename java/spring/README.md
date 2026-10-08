# Spring Boot app (Java)

A small Spring Boot web app built with Maven. It starts by itself and shows in the preview. The first
start takes a minute while Maven downloads dependencies.

## Run it

The app is already running in the `app` terminal tab. It doesn't reload on save, so restart it after
you edit. To restart it, click the `app` terminal tab, press Ctrl+C, then press ↑ and Enter.

Try these paths in the preview:

- `/` shows the home page.
- `/api/hello?name=Ada` returns `{"message": "Hello, Ada!"}`.

## Test it

```bash
mvn -q test
```

Or click **Run tests** in the Tests view. That runs the same tests used for grading.

## Files

- `src/main/java/com/example/demo/GreetingController.java` holds the routes.
- `src/main/java/com/example/demo/DemoApplication.java` starts the app.
- `src/test/java/com/example/demo/GreetingControllerTest.java` holds the tests.
- `pom.xml` lists the dependencies.
