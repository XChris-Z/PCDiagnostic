use crate::models::{BatteryInfo, HealthStatus};
use windows_sys::Win32::System::Power::{GetSystemPowerStatus, SYSTEM_POWER_STATUS};

pub fn collect_battery_info() -> Option<BatteryInfo> {
    // 1. Fast Native Windows API check
    unsafe {
        let mut sps: SYSTEM_POWER_STATUS = std::mem::zeroed();
        if GetSystemPowerStatus(&mut sps) != 0 {
            // BATTERY_FLAG_NO_BATTERY = 128
            if sps.BatteryFlag & 128 != 0 || sps.BatteryLifePercent == 255 {
                return None;
            }
        }
    }

    // 2. Query CIM Win32_Battery
    let cmd = "Get-CimInstance Win32_Battery | Select-Object Name, EstimatedChargeRemaining, BatteryStatus, DesignCapacity, FullChargeCapacity | ConvertTo-Json -Compress";
    let output = crate::utils::new_hidden_command("powershell")
        .args(["-NoProfile", "-NonInteractive", "-Command", cmd])
        .output()
        .ok()?;

    if !output.status.success() {
        return None;
    }

    let json_str = String::from_utf8_lossy(&output.stdout);
    let val = serde_json::from_str::<serde_json::Value>(&json_str).ok()?;

    if val.is_null() {
        return None;
    }

    let charge_pct = val["EstimatedChargeRemaining"].as_u64().unwrap_or(100) as u32;
    let battery_status = val["BatteryStatus"].as_u64().unwrap_or(1);
    let is_charging = battery_status == 2 || battery_status == 6 || battery_status == 7 || battery_status == 8;

    // Optional deep battery telemetry via WMI static data
    let (design_capacity, full_capacity, cycle_count) = query_wmi_battery_deep();

    let wear_level_pct = match (design_capacity, full_capacity) {
        (Some(d), Some(f)) if d > 0 && d >= f => {
            let wear = ((d - f) as f32 / d as f32) * 100.0;
            Some((wear * 10.0).round() / 10.0)
        }
        _ => None,
    };

    let health = match wear_level_pct {
        Some(w) if w >= 45.0 => HealthStatus::Critical,
        Some(w) if w >= 25.0 => HealthStatus::Warning,
        _ => HealthStatus::Optimal,
    };

    Some(BatteryInfo {
        is_laptop: true,
        is_charging,
        charge_pct,
        design_capacity_mwh: design_capacity,
        full_charge_capacity_mwh: full_capacity,
        wear_level_pct,
        estimated_runtime_min: None,
        cycle_count,
        health,
    })
}

fn query_wmi_battery_deep() -> (Option<u64>, Option<u64>, Option<u32>) {
    let cmd = r#"try {
        $xmlPath = "$env:TEMP\omni_bat.xml";
        powercfg /batteryreport /output $xmlPath /xml | Out-Null;
        if (Test-Path $xmlPath) {
            [xml]$xml = Get-Content $xmlPath;
            $b = $xml.BatteryReport.Batteries.Battery | Select-Object -First 1;
            [PSCustomObject]@{
                DesignedCapacity = [uint64]$b.DesignCapacity;
                FullChargedCapacity = [uint64]$b.FullChargeCapacity;
                CycleCount = [uint32]$b.CycleCount;
            } | ConvertTo-Json -Compress;
            Remove-Item $xmlPath -Force -ErrorAction SilentlyContinue;
        } else { '{}' }
    } catch { '{}' }"#;

    if let Ok(out) = crate::utils::new_hidden_command("powershell")
        .args(["-NoProfile", "-NonInteractive", "-Command", cmd])
        .output()
    {
        if out.status.success() {
            let json_str = String::from_utf8_lossy(&out.stdout);
            if let Ok(val) = serde_json::from_str::<serde_json::Value>(&json_str) {
                let d = val["DesignedCapacity"].as_u64().filter(|&v| v > 0);
                let f = val["FullChargedCapacity"].as_u64().filter(|&v| v > 0);
                let c = val["CycleCount"].as_u64().map(|v| v as u32);
                if d.is_some() || f.is_some() {
                    return (d, f, c);
                }
            }
        }
    }

    // Fallback to WMI if powercfg report was unavailable
    let fallback_cmd = "$f = Get-CimInstance -Namespace root\\wmi -ClassName BatteryFullChargedCapacity -ErrorAction SilentlyContinue | Select-Object -First 1 FullChargedCapacity; [PSCustomObject]@{ FullChargedCapacity = $f.FullChargedCapacity } | ConvertTo-Json -Compress";
    if let Ok(out) = crate::utils::new_hidden_command("powershell")
        .args(["-NoProfile", "-NonInteractive", "-Command", fallback_cmd])
        .output()
    {
        if out.status.success() {
            let json_str = String::from_utf8_lossy(&out.stdout);
            if let Ok(val) = serde_json::from_str::<serde_json::Value>(&json_str) {
                let f = val["FullChargedCapacity"].as_u64();
                return (None, f, None);
            }
        }
    }

    (None, None, None)
}
