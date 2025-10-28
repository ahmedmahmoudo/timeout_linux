use tauri::{AppHandle, Emitter, State};
use uuid::Uuid;

use crate::state::{AppState, Break, CreateableBreak, UpdateBreak};

#[tauri::command(rename_all = "snake_case")]
pub fn add_break(
    state: State<AppState>,
    app_handle: AppHandle,
    break_to_add: CreateableBreak,
) -> Result<String, String> {
    let id = state.add_break(break_to_add);
    let _ = app_handle
        .emit("breaks-tick", state.list_breaks())
        .map_err(|e| e.to_string())?;
    Ok(id)
}

#[tauri::command]
pub fn get_break(state: State<AppState>, id: Uuid) -> Result<Break, String> {
    state.get_break(id)
}

#[tauri::command]
pub fn get_breaks(state: State<AppState>) -> Result<Vec<Break>, String> {
    Ok(state.list_breaks())
}

#[tauri::command(rename_all = "snake_case")]
pub fn update_break(
    state: State<AppState>,
    app_handle: AppHandle,
    payload: UpdateBreak,
) -> Result<Break, String> {
    let updated = state.update_break(payload)?;

    let _ = app_handle
        .emit("break-updated", &updated)
        .map_err(|e| e.to_string())?;

    let _ = app_handle
        .emit("breaks-tick", state.list_breaks())
        .map_err(|e| e.to_string())?;

    Ok(updated)
}
