pub mod hardware;
pub mod models;
pub mod report_pdf;
pub mod utils;

use models::SystemDiagnostics;
use tauri::command;

#[command]
fn get_system_diagnostics() -> Result<SystemDiagnostics, String> {
    Ok(hardware::perform_full_diagnostic())
}

#[command]
fn export_pdf_report(diagnostics: SystemDiagnostics) -> Result<String, String> {
    report_pdf::save_report_to_disk(&diagnostics)
}

#[command]
fn get_html_report_content(diagnostics: SystemDiagnostics) -> Result<String, String> {
    Ok(report_pdf::generate_html_report(&diagnostics))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_system_diagnostics,
            export_pdf_report,
            get_html_report_content
        ])
        .run(tauri::generate_context!())
        .expect("error while running OmniCheck PC application");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_diagnostic() {
        let diag = hardware::perform_full_diagnostic();
        println!("HOSTNAME: {}", diag.hostname);
        println!("CPU: {}", diag.cpu.model);
        println!("RAM: {} GB", diag.ram.total_gb);
        println!("STORAGE: {} disks", diag.storage.len());
        for d in &diag.storage {
            println!("  DISK: {} | {} | Wear: {:?} | SMART: {}", d.name, d.mount_point, d.wear_level_pct, d.smart_status);
        }
        println!("GPUS: {} gpus", diag.gpus.len());
        println!("BIOS DATE: {}", diag.motherboard.bios_date);
        println!("TPM: {}", diag.security.tpm_status);
        if let Some(b) = &diag.battery {
            println!("BATTERY: Design: {:?} mWh | Full: {:?} mWh | Wear: {:?}%", b.design_capacity_mwh, b.full_charge_capacity_mwh, b.wear_level_pct);
        }
        println!("TOTAL SCORE: {}/100", diag.health_score);
        for cat in &diag.score_breakdown.categories {
            println!("  PILLAR: {} = {}/{} (deduct: {}) - {}", cat.name, cat.score, cat.max_points, cat.deduction, cat.details);
        }
    }
}
