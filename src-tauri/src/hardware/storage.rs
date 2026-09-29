use crate::models::{DiskInfo, HealthStatus};
use sysinfo::Disks;

#[derive(Debug, Clone, Default)]
struct PhysicalDiskInfo {
    friendly_name: String,
    media_type: String,
    bus_type: String,
    health_status_num: u32,
    health_str: String,
    wear_level_pct: Option<f32>,
    temperature_c: Option<f32>,
}

pub fn collect_storage_info() -> Vec<DiskInfo> {
    let disks = Disks::new_with_refreshed_list();
    let physical_telemetry = query_msft_physical_disks();

    let mut result = Vec::new();

    for disk in &disks {
        let mount_point = disk.mount_point().to_string_lossy().to_string();
        let name = disk.name().to_string_lossy().to_string();
        let total_bytes = disk.total_space();
        let free_bytes = disk.available_space();
        let total_gb = (total_bytes as f64 / 1024.0 / 1024.0 / 1024.0 * 100.0).round() / 100.0;
        let free_gb = (free_bytes as f64 / 1024.0 / 1024.0 / 1024.0 * 100.0).round() / 100.0;
        let used_pct = if total_bytes > 0 {
            (((total_bytes - free_bytes) as f32 / total_bytes as f32) * 100.0 * 10.0).round() / 10.0
        } else {
            0.0
        };
        let file_system = disk.file_system().to_string_lossy().to_string();
        let is_removable = disk.is_removable();

        // Match with physical disk telemetry if available
        let matched_phys = physical_telemetry
            .iter()
            .find(|p| !p.friendly_name.is_empty() && (name.contains(&p.friendly_name) || p.friendly_name.contains(&name)))
            .or_else(|| physical_telemetry.first());

        let (media_type, bus_type, smart_status, wear_level_pct, temperature_c, phys_health) = if is_removable {
            ("USB Flash / Extraíble".to_string(), "USB".to_string(), "No disponible / Genérico".to_string(), None, None, HealthStatus::Optimal)
        } else if let Some(phys) = matched_phys {
            let h = match phys.health_status_num {
                0 => HealthStatus::Optimal,
                1 => HealthStatus::Warning,
                _ => HealthStatus::Critical,
            };
            (phys.media_type.clone(), phys.bus_type.clone(), phys.health_str.clone(), phys.wear_level_pct, phys.temperature_c, h)
        } else {
            ("Disco Fijo".to_string(), "SATA/NVMe".to_string(), "Genérico / Estado Normal".to_string(), None, None, HealthStatus::Optimal)
        };

        // Disk space health evaluation
        let space_health = if used_pct >= 95.0 {
            HealthStatus::Critical
        } else if used_pct >= 88.0 {
            HealthStatus::Warning
        } else {
            HealthStatus::Optimal
        };

        // Overall disk health takes worst of physical health and free space
        let final_health = match (&phys_health, &space_health) {
            (HealthStatus::Critical, _) | (_, HealthStatus::Critical) => HealthStatus::Critical,
            (HealthStatus::Warning, _) | (_, HealthStatus::Warning) => HealthStatus::Warning,
            _ => HealthStatus::Optimal,
        };

        let disk_display_name = if !name.is_empty() {
            name
        } else if let Some(phys) = matched_phys {
            format!("{} ({})", phys.friendly_name, mount_point)
        } else {
            format!("Unidad {}", mount_point)
        };

        result.push(DiskInfo {
            name: disk_display_name,
            mount_point,
            total_gb,
            free_gb,
            used_pct,
            file_system,
            media_type,
            bus_type,
            is_removable,
            smart_status,
            power_on_hours: None,
            wear_level_pct,
            temperature_c,
            health: final_health,
        });
    }

    result
}

fn query_msft_physical_disks() -> Vec<PhysicalDiskInfo> {
    let mut list = Vec::new();
    let cmd = "Get-CimInstance -Namespace root\\Microsoft\\Windows\\Storage MSFT_PhysicalDisk | Select-Object FriendlyName, MediaType, HealthStatus, BusType, Size | ConvertTo-Json -Compress";

    let output = crate::utils::new_hidden_command("powershell")
        .args(["-NoProfile", "-NonInteractive", "-Command", cmd])
        .output();

    if let Ok(out) = output {
        if out.status.success() {
            let json_str = String::from_utf8_lossy(&out.stdout);
            if let Ok(val) = serde_json::from_str::<serde_json::Value>(&json_str) {
                let items: Vec<serde_json::Value> = if val.is_array() {
                    val.as_array().cloned().unwrap_or_default()
                } else if val.is_object() {
                    vec![val]
                } else {
                    vec![]
                };

                // Query storage reliability counters (Wear, Temp, PowerOnHours) if elevated permissions allow
                let reliability_map = query_reliability_counters();

                for item in items {
                    let friendly_name = item["FriendlyName"].as_str().unwrap_or("").trim().to_string();
                    let media_type_code = item["MediaType"].as_u64().unwrap_or(0);
                    let media_type = match media_type_code {
                        3 => "HDD (Disco Mecánico)".to_string(),
                        4 => "SSD (Estado Sólido)".to_string(),
                        5 => "SCM (Memoria de Clase de Almacenamiento)".to_string(),
                        _ => "Unidad Estándar".to_string(),
                    };

                    let bus_type_code = item["BusType"].as_u64().unwrap_or(0);
                    let bus_type = match bus_type_code {
                        17 => "NVMe (PCI Express)".to_string(),
                        11 | 8 => "SATA".to_string(),
                        7 => "USB".to_string(),
                        14 => "SAS".to_string(),
                        _ => "Estándar".to_string(),
                    };

                    let health_num = item["HealthStatus"].as_u64().unwrap_or(0) as u32;
                    let health_str = match health_num {
                        0 => "SMART: Saludable / Correcto (Sin fallos de sectores)".to_string(),
                        1 => "SMART: Advertencia / Sectores bajo revisión".to_string(),
                        2 => "SMART: No saludable / Fallo inminente".to_string(),
                        _ => "SMART: Genérico / Estado Nominal".to_string(),
                    };

                    let _size_bytes = item["Size"].as_u64().unwrap_or(0);

                    // Check if reliability counters returned wear or temp for this drive
                    let (wear_val, temp_val) = reliability_map
                        .iter()
                        .find(|(name, _, _)| !name.is_empty() && (friendly_name.contains(name) || name.contains(&friendly_name)))
                        .map(|(_, w, t)| (*w, *t))
                        .unwrap_or((None, None));

                    // Wear level applies ONLY to Solid State Drives (SSDs / NVMe), never to mechanical HDDs
                    let is_ssd = media_type_code == 4 || media_type.contains("SSD") || bus_type.contains("NVMe");
                    let assigned_wear = if is_ssd { wear_val } else { None };

                    list.push(PhysicalDiskInfo {
                        friendly_name,
                        media_type,
                        bus_type,
                        health_status_num: health_num,
                        health_str,
                        wear_level_pct: assigned_wear,
                        temperature_c: temp_val,
                    });
                }
            }
        }
    }

    list
}

fn query_reliability_counters() -> Vec<(String, Option<f32>, Option<f32>)> {
    let mut results = Vec::new();
    let cmd = r#"Get-PhysicalDisk | ForEach-Object { $d = $_; $r = $null; try { $r = $d | Get-StorageReliabilityCounter -ErrorAction SilentlyContinue } catch {}; [PSCustomObject]@{ FriendlyName = $d.FriendlyName; Wear = if ($r) { $r.Wear } else { $null }; Temperature = if ($r) { $r.Temperature } else { $null } } } | ConvertTo-Json -Compress"#;

    if let Ok(out) = crate::utils::new_hidden_command("powershell")
        .args(["-NoProfile", "-NonInteractive", "-Command", cmd])
        .output()
    {
        if out.status.success() {
            let json_str = String::from_utf8_lossy(&out.stdout);
            if let Ok(val) = serde_json::from_str::<serde_json::Value>(&json_str) {
                let items: Vec<serde_json::Value> = if val.is_array() {
                    val.as_array().cloned().unwrap_or_default()
                } else if val.is_object() {
                    vec![val]
                } else {
                    vec![]
                };

                for it in items {
                    let name = it["FriendlyName"].as_str().unwrap_or("").trim().to_string();
                    // In Windows Storage, Wear is the % of endurance consumed (0 = brand new, 100 = end of life)
                    // If Wear is reported (0..=100), remaining health life is (100.0 - Wear)
                    let wear_pct = it["Wear"].as_f64().and_then(|w| {
                        if (0.0..=100.0).contains(&w) {
                            Some((100.0 - w as f32).clamp(1.0, 100.0))
                        } else {
                            None
                        }
                    });
                    let temp_c = it["Temperature"].as_f64().filter(|&t| t > 0.0 && t < 120.0).map(|t| t as f32);
                    results.push((name, wear_pct, temp_c));
                }
            }
        }
    }

    results
}
