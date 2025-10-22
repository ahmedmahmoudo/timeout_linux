use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    App, Wry,
};

pub fn get_app_menu(
    app: &mut App,
    break_time: &str,
) -> tauri::Result<(Menu<Wry>, MenuItem<Wry>)> {
    let status = MenuItem::with_id(app, "status", break_time, false, None::<&str>)?;
    let status_sep = PredefinedMenuItem::separator(app)?;
    let open = MenuItem::with_id(app, "open", "Open", true, None::<&str>)?;
    let sep = PredefinedMenuItem::separator(app)?;
    let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&status, &status_sep, &open, &sep, &quit])?;
    Ok((menu, status))
}
