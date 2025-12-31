use reqwest::Method;
use serde::{Deserialize, Serialize};
use tauri::State;

struct BackendClient(reqwest::Client);

impl BackendClient {
    fn new() -> Self {
        let client = reqwest::Client::builder()
            .cookie_store(true)
            .build()
            .expect("failed to build http client");

        Self(client)
    }
}

#[derive(Deserialize)]
struct ProxyRequestPayload {
    method: String,
    url: String,
    headers: Vec<(String, String)>,
    body: Option<String>,
}

#[derive(Serialize)]
struct ProxyResponsePayload {
    status: u16,
    headers: Vec<(String, String)>,
    body: Option<String>,
}

#[tauri::command]
async fn proxy_request(
    request: ProxyRequestPayload,
    client: State<'_, BackendClient>,
) -> Result<ProxyResponsePayload, String> {
    let method: Method = request
        .method
        .parse()
        .map_err(|_| "Invalid HTTP method".to_string())?;

    let mut builder = client.0.request(method, &request.url);

    for (key, value) in request.headers {
        builder = builder.header(&key, value);
    }

    if let Some(body) = request.body {
        builder = builder.body(body);
    }

    let response = builder.send().await.map_err(|e| e.to_string())?;
    let status = response.status().as_u16();
    let headers = response
        .headers()
        .iter()
        .map(|(k, v)| {
            (
                k.to_string(),
                v.to_str().unwrap_or_default().to_string(),
            )
        })
        .collect::<Vec<_>>();
    let bytes = response.bytes().await.map_err(|e| e.to_string())?;
    let body = if bytes.is_empty() {
        None
    } else {
        Some(String::from_utf8_lossy(&bytes).to_string())
    };

    Ok(ProxyResponsePayload {
        status,
        headers,
        body,
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(BackendClient::new())
        .invoke_handler(tauri::generate_handler![proxy_request])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
