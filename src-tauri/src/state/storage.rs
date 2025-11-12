use crate::state::controller::{Break, BreakAppearance};
use serde::{Deserialize, Serialize};
use tauri::AppHandle;
use tauri_plugin_store::StoreBuilder;
use uuid::Uuid;

const STORE_PATH: &str = "breaks.store";
const STORE_KEY: &str = "breaks";

#[derive(Serialize, Deserialize, Clone)]
struct PersistedBreak {
    id: Uuid,
    name: String,
    every: u32,
    duration: u32,
    color: (u8, u8, u8),
    shortcut: Option<String>,
    description: Option<String>,
    appearance: BreakAppearance,
}

impl From<&Break> for PersistedBreak {
    fn from(brek: &Break) -> Self {
        Self {
            id: brek.id,
            name: brek.name.clone(),
            every: brek.every,
            duration: brek.duration,
            color: brek.color,
            shortcut: brek.shortcut.clone(),
            description: brek.description.clone(),
            appearance: brek.appearance.clone(),
        }
    }
}

impl From<PersistedBreak> for Break {
    fn from(value: PersistedBreak) -> Self {
        Break {
            id: value.id,
            name: value.name,
            every: value.every,
            duration: value.duration,
            color: value.color,
            remaning: value.every,
            run_time: None,
            is_running: Some(false),
            is_paused: Some(false),
            shortcut: value.shortcut,
            description: value.description,
            appearance: value.appearance,
            is_preview: Some(false),
        }
    }
}

pub fn load_breaks(app_handle: &AppHandle) -> Vec<Break> {
    let store = match StoreBuilder::new(app_handle, STORE_PATH)
        .auto_save(std::time::Duration::from_millis(250))
        .build()
    {
        Ok(store) => store,
        Err(err) => {
            eprintln!("failed to open breaks store: {err}");
            return Vec::new();
        }
    };

    let Some(value) = store.get(STORE_KEY) else {
        return Vec::new();
    };

    match serde_json::from_value::<Vec<PersistedBreak>>(value) {
        Ok(items) => items.into_iter().map(Into::into).collect(),
        Err(err) => {
            eprintln!("failed to parse persisted breaks: {err}");
            Vec::new()
        }
    }
}

pub fn persist_breaks(app_handle: &AppHandle, breaks: &[Break]) {
    let store = match StoreBuilder::new(app_handle, STORE_PATH)
        .auto_save(std::time::Duration::from_millis(250))
        .build()
    {
        Ok(store) => store,
        Err(err) => {
            eprintln!("failed to open breaks store: {err}");
            return;
        }
    };

    let payload: Vec<PersistedBreak> = breaks.iter().map(PersistedBreak::from).collect();
    match serde_json::to_value(payload) {
        Ok(value) => {
            store.set(STORE_KEY, value);
            if let Err(err) = store.save() {
                eprintln!("failed to save breaks store: {err}");
            }
        }
        Err(err) => eprintln!("failed to serialize breaks: {err}"),
    }
}
