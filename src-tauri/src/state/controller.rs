use serde::{Deserialize, Serialize};
use std::{path::PathBuf, sync::Mutex};
use tauri::{AppHandle, Emitter};
use tauri_plugin_notification::NotificationExt;
use uuid::Uuid;

#[derive(Clone, Serialize, Deserialize)]
pub struct Break {
    pub id: Uuid,
    pub name: String,
    pub every: u32,
    pub duration: u32,
    pub color: (u8, u8, u8),
    pub remaning: u32,
    pub run_time: Option<u32>,
    pub is_running: Option<bool>,
    pub is_paused: Option<bool>,
    pub shortcut: Option<String>,
    pub description: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct CreateableBreak {
    pub name: String,
    pub every: u32,
    pub duration: u32,
    pub color: (u8, u8, u8),
    pub remaning: u32,
    pub shortcut: Option<String>,
    pub description: Option<String>,
    pub is_paused: Option<bool>,
}

#[derive(Deserialize)]
pub struct UpdateBreak {
    pub id: Uuid,
    pub name: Option<String>,
    pub every: Option<u32>,
    pub duration: Option<u32>,
    pub color: Option<(u8, u8, u8)>,
    pub remaning: Option<u32>,
    pub shortcut: Option<Option<String>>,
    pub description: Option<Option<String>>,
    pub is_paused: Option<Option<bool>>,
}

#[derive(Default)]
pub struct AppState {
    breaks: Mutex<Vec<Break>>,
    theme_path: Mutex<Option<PathBuf>>,
}

impl AppState {
    pub fn new(initial: Vec<Break>) -> Self {
        Self {
            breaks: Mutex::new(initial),
            theme_path: Mutex::new(None),
        }
    }

    pub fn list_breaks(&self) -> Vec<Break> {
        self.breaks.lock().expect("state poisoned").clone()
    }

    pub fn add_break(&self, new_break: CreateableBreak) -> String {
        let id = Uuid::new_v4();
        self.breaks.lock().expect("state poisoned").push(Break {
            id,
            name: new_break.name,
            color: new_break.color,
            duration: new_break.duration,
            every: new_break.every,
            remaning: new_break.remaning,
            is_running: None,
            run_time: None,
            is_paused: new_break.is_paused,
            shortcut: new_break.shortcut,
            description: new_break.description,
        });

        id.to_string()
    }

    pub fn run_timer(&self, app_handle: AppHandle) {
        let mut started: Vec<Break> = Vec::new();
        let mut updated: Vec<Break> = Vec::new();
        let mut finished: Vec<Break> = Vec::new();

        {
            let mut breaks = self.breaks.lock().expect("state poisoned");
            for b in breaks.iter_mut() {
                if b.is_running.unwrap_or(false) {
                    if b.is_paused.unwrap_or(false) {
                        updated.push(b.clone());
                        continue;
                    }

                    let current = b.run_time.unwrap_or(0);
                    if current == 0 {
                        b.is_running = Some(false);
                        b.is_paused = Some(false);
                        b.run_time = None;
                        b.remaning = b.every;
                        finished.push(b.clone());
                        continue;
                    }

                    let next = current.saturating_sub(1);
                    b.run_time = Some(next);

                    if next == 0 {
                        b.is_running = Some(false);
                        b.is_paused = Some(false);
                        b.run_time = None;
                        b.remaning = b.every;
                        finished.push(b.clone());
                    } else {
                        updated.push(b.clone());
                    }

                    continue;
                }

                if b.remaning == 0 {
                    continue;
                }

                b.remaning = b.remaning.saturating_sub(1);

                if b.remaning == 0 {
                    b.is_running = Some(true);
                    b.is_paused = Some(false);
                    b.run_time = Some(b.duration);
                    started.push(b.clone());
                    updated.push(b.clone());
                }
            }
        }

        for started_break in &started {
            let message = format!("Your break {} started", started_break.name);
            if let Err(err) = app_handle
                .notification()
                .builder()
                .title("Timeout")
                .body(message)
                .show()
            {
                eprintln!("failed to show break notification: {err}");
            }

            crate::window::show_break_overlay(&app_handle, started_break);
            let _ = app_handle.emit("break-updated", started_break);
        }

        for running_break in &updated {
            crate::window::update_break_overlay(&app_handle, running_break);
        }

        for finished_break in &finished {
            crate::window::close_break_overlay(&app_handle, finished_break);
            let _ = app_handle.emit("break-updated", finished_break);
        }
    }

    pub fn get_break(&self, id: Uuid) -> Result<Break, String> {
        let breaks = self.breaks.lock().expect("state poisoned");
        let found_break = breaks.iter().find(|b| b.id == id);

        let message = format!("break with uuid {id} was not found");
        found_break.cloned().ok_or_else(|| message)
    }

    pub fn update_break(&self, payload: UpdateBreak) -> Result<Break, String> {
        let mut breaks = self.breaks.lock().expect("state poisoned");
        let target = breaks
            .iter_mut()
            .find(|b| b.id == payload.id)
            .ok_or_else(|| format!("break with uuid {} was not found", payload.id))?;

        if let Some(name) = payload.name {
            target.name = name;
        }
        if let Some(every) = payload.every {
            target.every = every;
        }
        if let Some(duration) = payload.duration {
            target.duration = duration;
        }
        if let Some(color) = payload.color {
            target.color = color;
        }
        if let Some(remaning) = payload.remaning {
            target.remaning = remaning;
        }
        if let Some(shortcut) = payload.shortcut {
            target.shortcut = shortcut;
        }
        if let Some(description) = payload.description {
            target.description = description;
        }
        if let Some(is_paused) = payload.is_paused {
            target.is_paused = is_paused;
        }

        Ok(target.clone())
    }

    pub fn delete_break(&self, id: Uuid) -> Result<Break, String> {
        let mut breaks = self.breaks.lock().expect("state poisoned");
        let index = breaks.iter().position(|b| b.id == id);

        match index {
            Some(idx) => Ok(breaks.remove(idx)),
            None => Err(format!("break with uuid {} was not found", id)),
        }
    }

    pub fn start_break(&self, id: Uuid) -> Result<Break, String> {
        let mut breaks = self.breaks.lock().expect("state poisoned");
        let target = breaks
            .iter_mut()
            .find(|b| b.id == id)
            .ok_or_else(|| format!("break with uuid {} was not found", id))?;

        target.remaning = 0;
        target.is_running = Some(true);
        target.is_paused = Some(false);
        target.run_time = Some(target.duration);

        Ok(target.clone())
    }

    pub fn skip_break(&self, id: Uuid) -> Result<Break, String> {
        let mut breaks = self.breaks.lock().expect("state poisoned");
        let target = breaks
            .iter_mut()
            .find(|b| b.id == id)
            .ok_or_else(|| format!("break with uuid {} was not found", id))?;

        target.remaning = target.every;
        target.is_running = Some(false);
        target.is_paused = Some(false);
        target.run_time = None;

        Ok(target.clone())
    }

    pub fn pause_break(&self, id: Uuid) -> Result<Break, String> {
        let mut breaks = self.breaks.lock().expect("state poisoned");
        let target = breaks
            .iter_mut()
            .find(|b| b.id == id)
            .ok_or_else(|| format!("break with uuid {} was not found", id))?;

        if target.is_running.unwrap_or(false) {
            target.is_running = Some(true);
            target.is_paused = Some(true);
        }

        Ok(target.clone())
    }

    pub fn resume_break(&self, id: Uuid) -> Result<Break, String> {
        let mut breaks = self.breaks.lock().expect("state poisoned");
        let target = breaks
            .iter_mut()
            .find(|b| b.id == id)
            .ok_or_else(|| format!("break with uuid {} was not found", id))?;

        if target.is_running.unwrap_or(false) || target.run_time.is_some() {
            target.is_running = Some(true);
            target.is_paused = Some(false);
            if target.run_time.is_none() {
                target.run_time = Some(target.duration);
            }
        }

        Ok(target.clone())
    }

    pub fn set_theme_path(&self, path: Option<PathBuf>) -> Result<(), String> {
        let mut theme_path = self.theme_path.lock().expect("state poisoned");

        if let Some(ref candidate) = path {
            if !candidate.exists() {
                return Err(format!(
                    "theme file {} was not found",
                    candidate.to_string_lossy()
                ));
            }
        }

        *theme_path = path;
        Ok(())
    }

    pub fn theme_path(&self) -> Option<PathBuf> {
        self.theme_path.lock().expect("state poisoned").clone()
    }
}
