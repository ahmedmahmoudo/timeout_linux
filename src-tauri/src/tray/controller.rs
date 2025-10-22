use std::{
    sync::{Arc, Mutex},
    thread,
    time::Duration,
};

use serde::{Deserialize, Serialize};
use tauri::{menu::MenuItem, tray::TrayIcon, Wry};

#[derive(Clone, Serialize, Deserialize)]
pub struct Break {
    name: String,
    every: u32,
    duration: u32,
    color: (u8, u8, u8),
    remaning: u32,
    run_time: u32,
    is_running: bool,
}

#[derive(Clone)]
pub struct TrayController {
    tray: TrayIcon,
    status_item: MenuItem<Wry>,
    breaks: Arc<Mutex<Vec<Break>>>,
}

impl TrayController {
    pub(crate) fn new(tray: TrayIcon, status_item: MenuItem<Wry>) -> Self {
        Self {
            tray,
            status_item,
            breaks: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub(crate) fn tray(&self) -> TrayIcon {
        self.tray.clone()
    }

    pub(crate) fn add_break(&self, break_to_add: Break) {
        self.breaks.lock().unwrap().push(break_to_add);
    }

    pub(crate) fn remove_break(&self, index: usize) {
        self.breaks.lock().unwrap().remove(index);
    }

    pub(crate) fn get_upcoming_break(&self) -> Result<Option<Break>, String> {
        let breaks = self
            .breaks
            .lock()
            .map_err(|_| "breaks lock poisoned".to_string())?;

        Ok(breaks.iter().min_by_key(|b| b.remaning).cloned())
    }

    // We decrease the remaning time and once it goes to 0 we set it to isRunning
    pub(crate) fn decrease_breaks(&self) {
        for b in self.breaks.lock().unwrap().iter_mut() {
            if b.remaning == 0 || b.is_running {
                continue;
            }

            b.remaning = b.remaning.saturating_sub(1);

            if b.remaning == 0 {
                b.is_running = true;
                b.run_time = b.duration;
            }
        }
    }

    // Checking each running break, if its done we reset the timer for it
    pub(crate) fn check_running(&self) {
        for b in self.breaks.lock().unwrap().iter_mut() {
            if b.is_running && b.run_time == 0 {
                b.is_running = false;
                b.remaning = b.every;
            }
        }
    }

    pub(crate) fn color(&self) -> Result<[u8; 4], String> {
        self.get_upcoming_break()?
            .map(|ub| rgba_from_rgb(ub.color))
            .ok_or_else(|| "no breaks scheduled".to_string())
    }

    pub(crate) fn current_label(&self) -> Result<String, String> {
        self.get_upcoming_break()?
            .map(|ub| ub.name)
            .ok_or_else(|| "no breaks scheduled".to_string())
    }

    pub(crate) fn set_status_text(&self, label: &str) -> Result<(), String> {
        let text = format!("Next break in: {}", label);
        self.status_item.set_text(text).map_err(|e| e.to_string())
    }
}

pub(crate) fn rgba_from_rgb(rgb: (u8, u8, u8)) -> [u8; 4] {
    [rgb.0, rgb.1, rgb.2, u8::MAX]
}

pub(crate) fn start_countdown_loop(controller: TrayController) {
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

                let color = match controller.color() {
                    Ok(c) => c,
                    Err(err) => {
                        eprintln!("failed to read tray color: {err}");
                        [0xFF, 0x33, 0x33, 0xFF]
                    }
                };

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

                controller.decrease_breaks();
                controller.check_running();
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
