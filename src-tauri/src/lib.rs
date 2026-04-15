// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn shutdown_now() -> Result<String, String> {
    match std::process::Command::new("shutdown").args(&["/s", "/t", "0"]).output() {
        Ok(_) => Ok("Shutdown initiated.".to_string()),
        Err(e) => Err(format!("Failed to shutdown: {}", e)),
    }
}

#[tauri::command]
fn shutdown_in_seconds(seconds: u32) -> Result<String, String> {
    match std::process::Command::new("shutdown").args(&["/s", "/t", &seconds.to_string()]).output() {
        Ok(_) => Ok(format!("Shutdown scheduled in {} seconds.", seconds)),
        Err(e) => Err(format!("Failed to schedule shutdown: {}", e)),
    }
}

#[tauri::command]
fn cancel_shutdown() -> Result<String, String> {
    match std::process::Command::new("shutdown").arg("/a").output() {
        Ok(_) => Ok("Shutdown cancelled.".to_string()),
        Err(e) => Err(format!("Failed to cancel shutdown: {}", e)),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, shutdown_now, shutdown_in_seconds, cancel_shutdown])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
