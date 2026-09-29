use crate::models::{HealthStatus, RamInfo, RamSlot};
use std::time::Instant;
use sysinfo::System;

pub fn collect_memory_info(system: &mut System) -> RamInfo {
    system.refresh_memory();

    let total_bytes = system.total_memory();
    let used_bytes = system.used_memory();
    let available_bytes = system.available_memory();
    let total_gb = total_bytes as f64 / 1024.0 / 1024.0 / 1024.0;
    let used_gb = used_bytes as f64 / 1024.0 / 1024.0 / 1024.0;
    let available_gb = available_bytes as f64 / 1024.0 / 1024.0 / 1024.0;
    let usage_pct = if total_bytes > 0 {
        (used_bytes as f32 / total_bytes as f32) * 100.0
    } else {
        0.0
    };

    let swap_total_gb = system.total_swap() as f64 / 1024.0 / 1024.0 / 1024.0;
    let swap_used_gb = system.used_swap() as f64 / 1024.0 / 1024.0 / 1024.0;

    // Collect physical DIMM slots via CIM
    let slots = query_physical_ram_slots();

    // Perform quick memory consistency and bandwidth test (32 MB buffer)
    let (consistency_passed, bandwidth_mb_s) = run_quick_memory_test();

    let health = if !consistency_passed {
        HealthStatus::Critical
    } else if usage_pct > 92.0 {
        HealthStatus::Warning
    } else {
        HealthStatus::Optimal
    };

    RamInfo {
        total_gb: (total_gb * 100.0).round() / 100.0,
        used_gb: (used_gb * 100.0).round() / 100.0,
        available_gb: (available_gb * 100.0).round() / 100.0,
        usage_pct: (usage_pct * 10.0).round() / 10.0,
        swap_total_gb: (swap_total_gb * 100.0).round() / 100.0,
        swap_used_gb: (swap_used_gb * 100.0).round() / 100.0,
        slots,
        consistency_test_passed: consistency_passed,
        memory_speed_mb_s: (bandwidth_mb_s * 10.0).round() / 10.0,
        health,
    }
}

fn query_physical_ram_slots() -> Vec<RamSlot> {
    let mut slots = Vec::new();
    let cmd = "Get-CimInstance Win32_PhysicalMemory | Select-Object DeviceLocator, Manufacturer, Capacity, ConfiguredClockSpeed, Speed, SMBIOSMemoryType | ConvertTo-Json -Compress";

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

                for (idx, item) in items.iter().enumerate() {
                    let locator = item["DeviceLocator"]
                        .as_str()
                        .unwrap_or(&format!("DIMM {}", idx))
                        .trim()
                        .to_string();
                    let manufacturer = item["Manufacturer"]
                        .as_str()
                        .unwrap_or("Genérico")
                        .trim()
                        .to_string();
                    let capacity_bytes = item["Capacity"].as_u64().unwrap_or(0);
                    let capacity_gb = (capacity_bytes as f64 / 1024.0 / 1024.0 / 1024.0 * 10.0).round() / 10.0;
                    let speed = item["ConfiguredClockSpeed"]
                        .as_u64()
                        .or_else(|| item["Speed"].as_u64())
                        .unwrap_or(0) as u32;

                    let smbios_type = item["SMBIOSMemoryType"].as_u64().unwrap_or(0);
                    let memory_type = match smbios_type {
                        20 => "DDR2",
                        24 => "DDR3",
                        26 => "DDR4",
                        30 | 34 => "DDR5",
                        _ => "DDR4 / SDRAM",
                    }
                    .to_string();

                    slots.push(RamSlot {
                        locator,
                        manufacturer,
                        capacity_gb,
                        speed_mhz: speed,
                        memory_type,
                    });
                }
            }
        }
    }

    slots
}

fn run_quick_memory_test() -> (bool, f64) {
    const TEST_WORDS: usize = 8 * 1024 * 1024; // 8M words * 4 bytes = 32 MB
    let mut buffer: Vec<u32> = vec![0u32; TEST_WORDS];

    let start = Instant::now();
    // Pattern 1: Alternating bitmask
    let pattern1: u32 = 0xAA55AA55;
    for (i, word) in buffer.iter_mut().enumerate() {
        *word = pattern1 ^ (i as u32);
    }

    // Verify pattern 1
    for (i, word) in buffer.iter().enumerate() {
        if *word != (pattern1 ^ (i as u32)) {
            return (false, 0.0);
        }
    }

    // Pattern 2: Walking bit inversion
    let pattern2: u32 = 0x55AA55AA;
    for (i, word) in buffer.iter_mut().enumerate() {
        *word = pattern2.wrapping_add(i as u32);
    }

    // Verify pattern 2
    for (i, word) in buffer.iter().enumerate() {
        if *word != pattern2.wrapping_add(i as u32) {
            return (false, 0.0);
        }
    }

    let elapsed = start.elapsed().as_secs_f64();
    // 32MB write + 32MB read + 32MB write + 32MB read = 128MB total bandwidth
    let total_mb_transferred = 128.0;
    let bandwidth_mb_s = if elapsed > 0.0 {
        total_mb_transferred / elapsed
    } else {
        0.0
    };

    (true, bandwidth_mb_s)
}
