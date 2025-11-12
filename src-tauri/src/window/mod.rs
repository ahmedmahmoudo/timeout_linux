use tauri::{AppHandle, Emitter, Manager, WebviewUrl, WebviewWindowBuilder};

use crate::state::Break;

pub fn open_or_create_floating(app: &tauri::AppHandle) {
    if let Some(w) = app.get_webview_window("float") {
        let _ = w.show();
        let _ = w.set_focus();
        return;
    }

    let _ = WebviewWindowBuilder::new(
        app,
        "float",
        WebviewUrl::App("index.html".into()), // or your devUrl in dev
    )
    .title("Floating")
    .decorations(false) // frameless
    .transparent(true) // enable transparent background
    .always_on_top(true) // stay above other windows
    .resizable(false)
    .auto_resize()
    .min_inner_size(800.0, 600.0)
    .skip_taskbar(true) // hide from taskbar/dock
    .build();
}

pub fn show_break_overlay(app: &AppHandle, break_data: &Break) {
    if let Some(window) = app.get_webview_window("break-session") {
        let _ = window.show();
        let _ = window.set_focus();
        let _ = window.emit("break-session-update", break_data);
        return;
    }

    match WebviewWindowBuilder::new(app, "break-session", WebviewUrl::App("overlay.html".into()))
        .title("Break Time")
        .decorations(false)
        .transparent(true)
        .resizable(false)
        .skip_taskbar(true)
        .always_on_top(true)
        .maximized(true)
        .closable(false)
        .build()
    {
        Ok(window) => {
            let _ = window.emit("break-session-update", break_data);
            if let Ok(Some(monitor)) = window.current_monitor() {
                let size = monitor.size();

                window.set_size(size.clone()).unwrap();
            }
        }
        Err(err) => {
            eprintln!("failed to create break session window: {err}");
        }
    }
}

pub fn update_break_overlay(app: &AppHandle, break_data: &Break) {
    if let Some(window) = app.get_webview_window("break-session") {
        let _ = window.emit("break-session-update", break_data);
    }
}

pub fn close_break_overlay(app: &AppHandle, break_data: &Break) {
    if let Some(window) = app.get_webview_window("break-session") {
        let _ = window.emit("break-session-ended", break_data);
        let _ = window.close();
    }
}
