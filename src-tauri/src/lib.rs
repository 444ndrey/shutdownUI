use std::process::Command;

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

#[cfg(target_os = "windows")]
const CREATE_NO_WINDOW: u32 = 0x08000000;

fn shutdown_command() -> Command {
    let mut cmd = Command::new("shutdown");
    #[cfg(target_os = "windows")]
    {
        cmd.creation_flags(CREATE_NO_WINDOW);
    }
    cmd
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn shutdown_now() -> Result<String, String> {
    shutdown_command()
        .args(["/s", "/t", "0"])
        .spawn()
        .map(|_| "Shutdown initiated.".to_string())
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn shutdown_in_seconds(seconds: u32) -> Result<String, String> {
    shutdown_command()
        .args(["/s", "/t", &seconds.to_string()])
        .spawn()
        .map(|_| format!("Shutdown scheduled in {} seconds.", seconds))
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn cancel_shutdown() -> Result<String, String> {
    let output = shutdown_command()
        .arg("/a")
        .output()
        .map_err(|e| e.to_string())?;
    let stdout = String::from_utf8_lossy(&output.stdout);
    if stdout.contains("No shutdown was scheduled") {
        Ok("No shutdown was scheduled.".to_string())
    } else {
        Ok("Shutdown cancelled.".to_string())
    }
}

// 🚀 главный запуск приложения
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            greet,
            shutdown_now,
            shutdown_in_seconds,
            cancel_shutdown
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}