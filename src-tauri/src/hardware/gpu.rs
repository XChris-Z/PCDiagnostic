use crate::models::{GpuInfo, HealthStatus};

pub fn collect_gpu_info() -> Vec<GpuInfo> {
    let mut gpus = Vec::new();

    // Query display controllers via CIM
    let cmd = "Get-CimInstance Win32_VideoController | Select-Object Name, DriverVersion, AdapterRAM, VideoProcessor | ConvertTo-Json -Compress";

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

                for item in items {
                    let name = item["Name"].as_str().unwrap_or("Controlador de Pantalla").trim().to_string();
                    let driver_version = item["DriverVersion"].as_str().unwrap_or("N/A").trim().to_string();
                    let adapter_ram = item["AdapterRAM"].as_u64().unwrap_or(0);
                    let vram_mb = adapter_ram / 1024 / 1024;
                    let video_processor = item["VideoProcessor"].as_str().unwrap_or("GPU").trim().to_string();

                    let name_lower = name.to_lowercase();
                    let is_dedicated = name_lower.contains("geforce")
                        || name_lower.contains("rtx")
                        || name_lower.contains("gtx")
                        || name_lower.contains("quadro")
                        || name_lower.contains("radeon rx")
                        || name_lower.contains("intel arc")
                        || vram_mb >= 2048;

                    let mut gpu_info = GpuInfo {
                        name: name.clone(),
                        is_dedicated,
                        driver_version,
                        vram_total_mb: vram_mb,
                        vram_used_mb: None,
                        temperature_c: None,
                        utilization_pct: None,
                        video_processor,
                        health: HealthStatus::Optimal,
                    };

                    // If NVIDIA, query live telemetry safely via nvidia-smi
                    if name_lower.contains("nvidia") {
                        if let Some((temp, util, total_mem, used_mem, drv)) = query_nvidia_smi() {
                            gpu_info.temperature_c = Some(temp);
                            gpu_info.utilization_pct = Some(util);
                            if total_mem > 0 {
                                gpu_info.vram_total_mb = total_mem;
                            }
                            gpu_info.vram_used_mb = Some(used_mem);
                            if !drv.is_empty() {
                                gpu_info.driver_version = drv;
                            }
                        }
                    }

                    // Health evaluation
                    gpu_info.health = match gpu_info.temperature_c {
                        Some(t) if t >= 90.0 => HealthStatus::Critical,
                        Some(t) if t >= 80.0 => HealthStatus::Warning,
                        _ => HealthStatus::Optimal,
                    };

                    gpus.push(gpu_info);
                }
            }
        }
    }

    // Sort: Dedicated GPUs first, then integrated
    gpus.sort_by(|a, b| b.is_dedicated.cmp(&a.is_dedicated));
    gpus
}

fn query_nvidia_smi() -> Option<(f32, f32, u64, u64, String)> {
    let output = crate::utils::new_hidden_command("nvidia-smi")
        .args([
            "--query-gpu=temperature.gpu,utilization.gpu,memory.total,memory.used,driver_version",
            "--format=csv,noheader,nounits",
        ])
        .output()
        .ok()?;

    if !output.status.success() {
        return None;
    }

    let out_str = String::from_utf8_lossy(&output.stdout);
    let line = out_str.lines().next()?;
    let parts: Vec<&str> = line.split(',').map(|s| s.trim()).collect();

    if parts.len() >= 5 {
        let temp = parts[0].parse::<f32>().ok()?;
        let util = parts[1].parse::<f32>().unwrap_or(0.0);
        let total_mem = parts[2].parse::<u64>().unwrap_or(0);
        let used_mem = parts[3].parse::<u64>().unwrap_or(0);
        let driver = parts[4].to_string();

        Some((temp, util, total_mem, used_mem, driver))
    } else {
        None
    }
}
