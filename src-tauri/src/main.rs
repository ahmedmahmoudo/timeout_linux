// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::Mutex;
use tauri::{tray::TrayIconBuilder, Manager, WindowEvent};

use crate::{
    menu::get_app_menu,
    tray::{add_break, generate_tray_icon, rgba_from_rgb, start_countdown_loop, TrayController},
    window::open_or_create_floating,
};

pub mod menu;
pub mod tray;
pub mod window;

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

fn main() {
    #[cfg(all(target_os = "linux"))]
    set_nvidia_wayland_safety_envs();

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![add_break])
        .on_window_event(|w, e| {
            if let WindowEvent::CloseRequested { api, .. } = e {
                api.prevent_close();
                let _ = w.hide();
            }
        })
        .setup(|app| {
            let initial_rgb = (255, 255, 255);
            let initial_color = rgba_from_rgb(initial_rgb);
            let initial_label = "No breaks".to_string();
            let (menu, status_item) = get_app_menu(app, &initial_label)?;
            let tray_image = generate_tray_icon(initial_color);

            let tray = TrayIconBuilder::with_id("status")
                .menu(&menu)
                .icon(tray_image)
                .show_menu_on_left_click(true)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "open" => open_or_create_floating(app),
                    "quit" => app.exit(0),
                    _ => {}
                })
                .build(app)?;

            let controller = TrayController::new(tray.clone(), status_item.clone());
            app.manage(Mutex::new(controller.clone()));
            tray.set_tooltip(Some(
                controller.current_label().unwrap_or_else(|_| "".into()),
            ))?;
            start_countdown_loop(controller);
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("Error while running tauri application");
}
