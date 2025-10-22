pub mod commands;
pub mod controller;

pub(crate) use commands::add_break;
pub(crate) use controller::{
    generate_tray_icon, rgba_from_rgb, start_countdown_loop, TrayController,
};
