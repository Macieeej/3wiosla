use axum::{routing::{get, post}, Router, Json, http::StatusCode};
use serde::{Deserialize, Serialize};
use tower_http::cors::CorsLayer;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    let app = Router::new()
        .route("/api/health", get(health_check))
        .route("/api/contact", post(send_contact_email))
        .layer(CorsLayer::permissive());

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3001")
        .await
        .unwrap();

    println!("Backend działa na http://localhost:3001");
    axum::serve(listener, app).await.unwrap();
}

async fn health_check() -> &'static str {
    "OK"
}

#[derive(Deserialize)]
struct ContactForm {
    name: String,
    email: String,
    phone: String,
    message: String,
}

#[derive(Serialize)]
struct ResendEmail {
    from: String,
    to: Vec<String>,
    subject: String,
    html: String,
    reply_to: String,
}

async fn send_contact_email(
    Json(form): Json<ContactForm>,
) -> (StatusCode, Json<serde_json::Value>) {
    let api_key = std::env::var("RESEND_API_KEY").unwrap_or_default();

    if api_key.is_empty() {
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({ "error": "Brak klucza API" })),
        );
    }

    let html = format!(
        r#"
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2d5a40;">Nowa wiadomość z formularza — 3 Wiosła</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px; font-weight: bold; color: #b8956a;">Imię i nazwisko</td><td style="padding: 8px;">{}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold; color: #b8956a;">E-mail</td><td style="padding: 8px;"><a href="mailto:{}">{}</a></td></tr>
                <tr><td style="padding: 8px; font-weight: bold; color: #b8956a;">Telefon</td><td style="padding: 8px;">{}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold; color: #b8956a; vertical-align: top;">Wiadomość</td><td style="padding: 8px;">{}</td></tr>
            </table>
        </div>
        "#,
        form.name, form.email, form.email, form.phone, form.message
    );

    let email = ResendEmail {
        from: "formularz@3wiosla.pl".to_string(),
        to: vec!["rezerwacje@brzozowazatoka.pl".to_string()],
        subject: format!("Nowa wiadomość od {} — 3 Wiosła", form.name),
        html,
        reply_to: form.email.clone(),
    };

    let client = reqwest::Client::new();
    let response = client
        .post("https://api.resend.com/emails")
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .json(&email)
        .send()
        .await;

    match response {
        Ok(res) if res.status().is_success() => (
            StatusCode::OK,
            Json(serde_json::json!({ "success": true })),
        ),
        Ok(res) => {
            let err = res.text().await.unwrap_or_default();
            eprintln!("Resend error: {}", err);
            (
                StatusCode::BAD_GATEWAY,
                Json(serde_json::json!({ "error": "Błąd wysyłania emaila" })),
            )
        }
        Err(e) => {
            eprintln!("Request error: {}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({ "error": "Błąd połączenia" })),
            )
        }
    }
}