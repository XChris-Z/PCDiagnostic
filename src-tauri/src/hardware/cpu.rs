use crate::models::{CpuInfo, HealthStatus};
use sysinfo::{Components, CpuRefreshKind, RefreshKind, System};

pub fn collect_cpu_info(system: &mut System) -> CpuInfo {
    // Refresh CPU list and usage with specific kinds
    system.refresh_specifics(
        RefreshKind::nothing()
            .with_cpu(CpuRefreshKind::everything()),
    );

    // Sleep 150ms to get an accurate CPU usage delta
    std::thread::sleep(std::time::Duration::from_millis(150));
    system.refresh_specifics(
        RefreshKind::nothing()
            .with_cpu(CpuRefreshKind::everything()),
    );

    let cpus = system.cpus();
    let model = cpus.first().map(|c| c.brand().trim().to_string()).unwrap_or_else(|| "Procesador Desconocido".to_string());
    let vendor = cpus.first().map(|c| c.vendor_id().trim().to_string()).unwrap_or_else(|| "N/A".to_string());
    let architecture = std::env::consts::ARCH.to_string();

    let physical_cores = system.physical_core_count().unwrap_or(cpus.len());
    let logical_cores = cpus.len();

    let base_clock_mhz = cpus.iter().map(|c| c.frequency()).max().unwrap_or(0);
    let current_clock_mhz = if !cpus.is_empty() {
        cpus.iter().map(|c| c.frequency()).sum::<u64>() / cpus.len() as u64
    } else {
        0
    };

    let total_usage_pct = system.global_cpu_usage();
    let per_core_usage: Vec<f32> = cpus.iter().map(|c| c.cpu_usage()).collect();

    // Query temperature sensors
    let components = Components::new_with_refreshed_list();
    let mut detected_temp: Option<f32> = None;

    for comp in &components {
        let label_lower = comp.label().to_lowercase();
        if label_lower.contains("cpu")
            || label_lower.contains("core")
            || label_lower.contains("package")
            || label_lower.contains("tctl")
            || label_lower.contains("tdie")
        {
            if let Some(t) = comp.temperature() {
                if t > 0.0 && t < 125.0 {
                    detected_temp = Some(t);
                    break;
                }
            }
        }
    }

    // Health evaluation
    let health = match detected_temp {
        Some(temp) if temp >= 90.0 => HealthStatus::Critical,
        Some(temp) if temp >= 78.0 => HealthStatus::Warning,
        _ => {
            if total_usage_pct > 95.0 {
                HealthStatus::Warning
            } else {
                HealthStatus::Optimal
            }
        }
    };

    CpuInfo {
        model,
        vendor,
        architecture,
        physical_cores,
        logical_cores,
        base_clock_mhz,
        current_clock_mhz,
        total_usage_pct,
        per_core_usage,
        temperature_c: detected_temp,
        health,
    }
}
