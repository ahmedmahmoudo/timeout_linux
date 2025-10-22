use tauri::State;

use super::controller::{Break, TrayController};

#[tauri::command(rename_all = "snake_case")]
pub fn add_break(state: State<'_, TrayController>, break_to_add: Break) -> Result<(), String> {
    state.add_break(break_to_add);
    Ok(())
}
