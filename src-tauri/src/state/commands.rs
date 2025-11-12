use std::path::PathBuf;

use tauri::{AppHandle, Emitter, State};
use tauri_plugin_notification::NotificationExt;
use uuid::Uuid;

use crate::state::controller::{AppState, Break, CreateableBreak, UpdateBreak};
use crate::window::{close_break_overlay, show_break_overlay, update_break_overlay};

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

#[tauri::command(rename_all = "snake_case")]
pub fn delete_break(state: State<AppState>, app_handle: AppHandle, id: Uuid) -> Result<(), String> {
    let deleted = state.delete_break(id)?;

    let _ = app_handle
        .emit("break-deleted", &deleted)
        .map_err(|e| e.to_string())?;

    let _ = app_handle
        .emit("breaks-tick", state.list_breaks())
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command(rename_all = "snake_case")]
pub fn start_break(
    state: State<AppState>,
    app_handle: AppHandle,
    id: Uuid,
) -> Result<Break, String> {
    let started = state.start_break(id)?;

    let message = format!("Your break {} started", started.name);
    if let Err(err) = app_handle
        .notification()
        .builder()
        .title("Timeout")
        .body(message)
        .show()
    {
        eprintln!("failed to show break start notification: {err}");
    }

    show_break_overlay(&app_handle, &started);

    let _ = app_handle
        .emit("break-updated", &started)
        .map_err(|e| e.to_string())?;

    let _ = app_handle
        .emit("breaks-tick", state.list_breaks())
        .map_err(|e| e.to_string())?;

    Ok(started)
}

#[tauri::command(rename_all = "snake_case")]
pub fn skip_break(
    state: State<AppState>,
    app_handle: AppHandle,
    id: Uuid,
) -> Result<Break, String> {
    let skipped = state.skip_break(id)?;

    close_break_overlay(&app_handle, &skipped);

    let _ = app_handle
        .emit("break-updated", &skipped)
        .map_err(|e| e.to_string())?;

    let _ = app_handle
        .emit("breaks-tick", state.list_breaks())
        .map_err(|e| e.to_string())?;

    Ok(skipped)
}

#[tauri::command(rename_all = "snake_case")]
pub fn pause_break(
    state: State<AppState>,
    app_handle: AppHandle,
    id: Uuid,
) -> Result<Break, String> {
    let paused = state.pause_break(id)?;

    update_break_overlay(&app_handle, &paused);

    let _ = app_handle
        .emit("break-updated", &paused)
        .map_err(|e| e.to_string())?;

    let _ = app_handle
        .emit("breaks-tick", state.list_breaks())
        .map_err(|e| e.to_string())?;

    Ok(paused)
}

#[tauri::command(rename_all = "snake_case")]
pub fn resume_break(
    state: State<AppState>,
    app_handle: AppHandle,
    id: Uuid,
) -> Result<Break, String> {
    let resumed = state.resume_break(id)?;

    show_break_overlay(&app_handle, &resumed);
    update_break_overlay(&app_handle, &resumed);

    let _ = app_handle
        .emit("break-updated", &resumed)
        .map_err(|e| e.to_string())?;

    let _ = app_handle
        .emit("breaks-tick", state.list_breaks())
        .map_err(|e| e.to_string())?;

    Ok(resumed)
}

#[tauri::command(rename_all = "snake_case")]
pub fn set_break_theme_path(
    state: State<AppState>,
    app_handle: AppHandle,
    path: String,
) -> Result<(), String> {
    let candidate = PathBuf::from(&path);
    let resolved = candidate
        .canonicalize()
        .unwrap_or_else(|_| candidate.clone());

    state.set_theme_path(Some(resolved.clone()))?;

    let _ = app_handle.emit(
        "break-theme-updated",
        Some(resolved.to_string_lossy().to_string()),
    );

    Ok(())
}

#[tauri::command(rename_all = "snake_case")]
pub fn clear_break_theme_path(state: State<AppState>, app_handle: AppHandle) -> Result<(), String> {
    state.set_theme_path(None)?;
    let _ = app_handle.emit::<Option<String>>("break-theme-updated", None);
    Ok(())
}

#[tauri::command(rename_all = "snake_case")]
pub fn get_break_theme_path(state: State<AppState>) -> Result<Option<String>, String> {
    Ok(state
        .theme_path()
        .map(|path| path.to_string_lossy().into_owned()))
}
