// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::TrayIconBuilder,
    Manager, WebviewUrl, WebviewWindowBuilder, WindowEvent,
};
fn set_nvidia_wayland_safety_envs() {
    // Only set if not already set by user; keep it app-scoped.
    for (k, v) in [
        // 1) Prefer OpenGL path in GTK to sidestep Vulkan+Wayland crashes on NVIDIA
        ("GSK_RENDERER", "ngl"),
        // 2) Work around WebKitGTK DMA-BUF instability on NVIDIA
        ("WEBKIT_DISABLE_DMABUF_RENDERER", "1"),
        // Optional: if you still see black/blank WebView or resize crashes, try:
        // ("WEBKIT_DISABLE_COMPOSITING_MODE", "1"),
    ] {
        if std::env::var_os(k).is_none() {
            std::env::set_var(k, v);
        }
    }
}

fn open_or_create_main(app: &tauri::AppHandle) {
    if let Some(w) = app.get_webview_window("main") {
        let _ = w.show();
        let _ = w.set_focus();
        return;
    }
    // Create the window on demand
    let _ = WebviewWindowBuilder::new(app, "main", tauri::WebviewUrl::App("index.html".into()))
        .title("MyTrayApp")
        .visible(true) // created visible now
        .min_inner_size(800.0, 540.0)
        .build();
}

fn open_or_create_floating(app: &tauri::AppHandle) {
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
    .skip_taskbar(true) // hide from taskbar/dock
    .inner_size(360.0, 120.0) // tweak to your UI
    .build();
}

fn main() {
    #[cfg(all(target_os = "linux"))]
    set_nvidia_wayland_safety_envs();

    tauri::Builder::default()
        .on_window_event(|w, e| {
            if let WindowEvent::CloseRequested { api, .. } = e {
                api.prevent_close();
                let _ = w.hide();
            }
        })
        .setup(|app| {
            let open = MenuItem::with_id(app, "open", "Open", true, None::<&str>)?;
            let sep = PredefinedMenuItem::separator(app)?;
            let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&open, &sep, &quit])?;

            TrayIconBuilder::new()
                .menu(&menu)
                .show_menu_on_left_click(true)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "open" => open_or_create_floating(app),
                    "quit" => app.exit(0),
                    _ => {}
                })
                .build(app)?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("Error while running tauri application");
}
