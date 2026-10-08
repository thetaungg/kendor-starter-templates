use axum::{Json, Router, extract::Query, response::Html, routing::get};
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
struct HelloParams {
    name: Option<String>,
}

#[derive(Serialize)]
struct Greeting {
    message: String,
}

async fn home() -> Html<&'static str> {
    Html("<h1>Hello from axum</h1><p>Edit src/main.rs, then restart the app.</p>")
}

async fn hello(Query(params): Query<HelloParams>) -> Json<Greeting> {
    let name = params.name.unwrap_or_else(|| "world".to_string());

    Json(Greeting { message: format!("Hello, {name}!") })
}

fn app() -> Router {
    Router::new().route("/", get(home)).route("/api/hello", get(hello))
}

#[tokio::main]
async fn main() {
    let host = std::env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string());
    let port = std::env::var("PORT").unwrap_or_else(|_| "8080".to_string());
    let listener = tokio::net::TcpListener::bind(format!("{host}:{port}")).await.unwrap();

    println!("listening on {host}:{port}");
    axum::serve(listener, app()).await.unwrap();
}

#[cfg(test)]
mod tests {
    use super::app;
    use axum::{body::Body, http::Request};
    use http_body_util::BodyExt;
    use tower::ServiceExt;

    async fn get_body(uri: &str) -> String {
        let request = Request::builder().uri(uri).body(Body::empty()).unwrap();
        let response = app().oneshot(request).await.unwrap();
        let bytes = response.into_body().collect().await.unwrap().to_bytes();

        String::from_utf8(bytes.to_vec()).unwrap()
    }

    #[tokio::test]
    async fn greets_the_world_by_default() {
        assert_eq!(get_body("/api/hello").await, r#"{"message":"Hello, world!"}"#);
    }

    #[tokio::test]
    async fn greets_by_name() {
        assert_eq!(get_body("/api/hello?name=Ada").await, r#"{"message":"Hello, Ada!"}"#);
    }
}
