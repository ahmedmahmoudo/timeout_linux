use serde::{Deserialize, Serialize};
use std::sync::Mutex;
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
}

#[derive(Default)]
pub struct AppState {
    breaks: Mutex<Vec<Break>>,
}

impl AppState {
    pub fn new(initial: Vec<Break>) -> Self {
        Self {
            breaks: Mutex::new(initial),
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
            shortcut: new_break.shortcut,
            description: new_break.description,
        });

        id.to_string()
    }

    pub fn run_timer(&self) {
        let mut breaks = self.breaks.lock().expect("state poisoned");
        for b in breaks.iter_mut() {
            if b.is_running.unwrap_or(false) || b.remaning <= 0 {
                continue;
            }

            b.remaning = b.remaning.saturating_sub(1);

            if b.remaning <= 0 {
                b.is_running = Some(true);
                b.run_time = Some(b.duration);
                self.play_break(b.clone())
            }
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

        Ok(target.clone())
    }

    fn play_break(&self, b: Break) {
        println!("Running {:?}", b.name.as_str())
    }
}
