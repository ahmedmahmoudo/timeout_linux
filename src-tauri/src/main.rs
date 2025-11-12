// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{thread, time::Duration};
use tauri::{tray::TrayIconBuilder, AppHandle, Emitter, Manager, WindowEvent};

use crate::{
    menu::get_app_menu,
    state::{
        add_break,
        clear_break_theme_path,
        delete_break,
        get_break,
        get_break_theme_path,
        get_breaks,
        pause_break,
        resume_break,
        set_break_theme_path,
        skip_break,
        start_break,
        update_break,
        AppState,
    },
    tray::{generate_tray_icon, rgba_from_rgb, TrayController},
    window::open_or_create_floating,
};

pub mod menu;
pub mod state;
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
        .plugin(tauri_plugin_notification::init())
        .manage(AppState::new(Vec::new()))
        .invoke_handler(tauri::generate_handler![
            add_break,
            get_breaks,
            get_break,
            get_break_theme_path,
            pause_break,
            resume_break,
            set_break_theme_path,
            skip_break,
            start_break,
            update_break,
            clear_break_theme_path,
            delete_break
        ])
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

            let handle = app.handle();
            let controller = TrayController::new(handle.clone(), tray.clone(), status_item.clone());
            start_countdown_loop(controller, handle.clone());
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("Error while running tauri application");
}

pub(crate) fn start_countdown_loop(controller: TrayController, app: AppHandle) {
    thread::spawn(move || loop {
        match controller.get_upcoming_break() {
            Ok(Some(upcoming_break)) => {
                let remaining = upcoming_break.remaning;
                let minutes = remaining / 60;
                let seconds = remaining % 60;
                let label = format!("{:02}:{:02}", minutes, seconds);

                if let Err(err) = controller.set_status_text(label.as_str()) {
                    eprintln!("failed to store tray label: {err}");
                }

                let color = rgba_from_rgb(upcoming_break.color);

                let icon = generate_tray_icon(color);

                if let Err(err) = controller.tray().set_icon(Some(icon)) {
                    eprintln!("failed to update tray icon: {err}");
                }
                if let Err(err) = controller.tray().set_tooltip(Some(label.clone())) {
                    eprintln!("failed to update tray tooltip: {err}");
                }
                if let Err(err) = controller.set_status_text(&label) {
                    eprintln!("failed to update tray menu status: {err}");
                }

                // decrease breaks timer
                let state = app.state::<AppState>();
                state.run_timer(app.clone());
                if let Err(err) = app.emit("breaks-tick", state.list_breaks()) {
                    eprintln!("failed to emit break tick: {err}");
                }
            }
            Ok(None) => {
                // No breaks configured yet; wait for the next iteration.
            }
            Err(err) => {
                eprintln!("failed to read upcoming break: {err}");
            }
        }

        thread::sleep(Duration::from_secs(1));
    });
}
