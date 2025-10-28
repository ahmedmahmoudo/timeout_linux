use crate::state::{AppState, Break};

use tauri::{menu::MenuItem, tray::TrayIcon, AppHandle, Manager, Wry};

pub struct TrayController {
    app: AppHandle,
    tray: TrayIcon,
    status_item: MenuItem<Wry>,
}

impl TrayController {
    pub(crate) fn new(app: AppHandle, tray: TrayIcon, status_item: MenuItem<Wry>) -> Self {
        Self {
            app,
            tray,
            status_item,
        }
    }

    pub(crate) fn tray(&self) -> TrayIcon {
        self.tray.clone()
    }

    fn breaks(&self) -> Vec<Break> {
        let state = self.app.state::<AppState>();

        state.list_breaks()
    }

    pub(crate) fn get_upcoming_break(&self) -> Result<Option<Break>, String> {
        Ok(self.breaks().iter().min_by_key(|b| b.remaning).cloned())
    }

    pub(crate) fn set_status_text(&self, label: &str) -> Result<(), String> {
        let text = format!("Next break in: {}", label);
        self.status_item.set_text(text).map_err(|e| e.to_string())
    }
}

pub(crate) fn rgba_from_rgb(rgb: (u8, u8, u8)) -> [u8; 4] {
    [rgb.0, rgb.1, rgb.2, u8::MAX]
}

pub(crate) fn generate_tray_icon(color: [u8; 4]) -> tauri::image::Image<'static> {
    const ICON_SIZE: u32 = 64;

    let mut buffer = vec![0u8; (ICON_SIZE * ICON_SIZE * 4) as usize];
    let radius = (ICON_SIZE as f32 / 2.0) - 1.0;
    let radius_sq = radius * radius;
    let center = (ICON_SIZE as f32 - 1.0) / 2.0;

    for y in 0..ICON_SIZE {
        for x in 0..ICON_SIZE {
            let dx = x as f32 - center;
            let dy = y as f32 - center;
            if dx * dx + dy * dy <= radius_sq {
                let idx = ((y * ICON_SIZE + x) * 4) as usize;
                buffer[idx] = color[0];
                buffer[idx + 1] = color[1];
                buffer[idx + 2] = color[2];
                buffer[idx + 3] = color[3];
            }
        }
    }

    tauri::image::Image::new_owned(buffer, ICON_SIZE, ICON_SIZE)
}
