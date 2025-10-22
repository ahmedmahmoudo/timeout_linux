use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};

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
