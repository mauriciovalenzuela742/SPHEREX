// Envoltorio de escritorio: abre el visor publicado en una ventana nativa.
// No hay lógica propia: los datos llegan por los mismos /api y /proto-api del sitio.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error al iniciar AstroTrack");
}
