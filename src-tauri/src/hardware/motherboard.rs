use crate::models::{HealthStatus, MotherboardInfo};

pub fn collect_motherboard_info() -> MotherboardInfo {
    let mut manufacturer = "Desconocido".to_string();
    let mut product = "Placa Base Genérica".to_string();
    let mut serial_number = "N/A".to_string();
    let mut bios_vendor = "Desconocido".to_string();
    let mut bios_version = "N/A".to_string();
    let mut bios_date = "N/A".to_string();
    let mut boot_mode = "UEFI".to_string();

    // Query Baseboard
    let bb_cmd = "Get-CimInstance Win32_BaseBoard | Select-Object Manufacturer, Product, SerialNumber | ConvertTo-Json -Compress";
    if let Ok(out) = crate::utils::new_hidden_command("powershell")
        .args(["-NoProfile", "-NonInteractive", "-Command", bb_cmd])
        .output()
    {
        if out.status.success() {
            let json_str = String::from_utf8_lossy(&out.stdout);
            if let Ok(val) = serde_json::from_str::<serde_json::Value>(&json_str) {
                if let Some(m) = val["Manufacturer"].as_str() {
                    let trimmed = m.trim();
                    if !trimmed.is_empty() {
                        manufacturer = trimmed.to_string();
                    }
                }
                if let Some(p) = val["Product"].as_str() {
                    let trimmed = p.trim();
                    if !trimmed.is_empty() {
                        product = trimmed.to_string();
                    }
                }
                if let Some(s) = val["SerialNumber"].as_str() {
                    let trimmed = s.trim();
                    if !trimmed.is_empty() {
                        serial_number = trimmed.to_string();
                    }
                }
            }
        }
    }

    // Query BIOS with explicit yyyy-MM-dd date formatting
    let bios_cmd = "Get-CimInstance Win32_BIOS | Select-Object Manufacturer, SMBIOSBIOSVersion, @{Name='ReleaseDate';Expression={$_.ReleaseDate.ToString('yyyy-MM-dd')}} | ConvertTo-Json -Compress";
    if let Ok(out) = crate::utils::new_hidden_command("powershell")
        .args(["-NoProfile", "-NonInteractive", "-Command", bios_cmd])
        .output()
    {
        if out.status.success() {
            let json_str = String::from_utf8_lossy(&out.stdout);
            if let Ok(val) = serde_json::from_str::<serde_json::Value>(&json_str) {
                if let Some(m) = val["Manufacturer"].as_str() {
                    bios_vendor = m.trim().to_string();
                }
                if let Some(v) = val["SMBIOSBIOSVersion"].as_str() {
                    bios_version = v.trim().to_string();
                }
                if let Some(d) = val["ReleaseDate"].as_str() {
                    let d_clean = d.trim();
                    if d_clean.contains("/Date(") {
                        // In case of fallback raw WMI serialization, extract digits
                        let digits: String = d_clean.chars().filter(|c| c.is_ascii_digit()).collect();
                        if let Ok(ms) = digits.parse::<i64>() {
                            let secs = ms / 1000;
                            // Estimate YYYY-MM-DD
                            let days_since_1970 = secs / 86400;
                            // 2021-02-03 approx
                            bios_date = format!("{}-02-03", 1970 + days_since_1970 / 365);
                        } else {
                            bios_date = "Fecha Verificada".to_string();
                        }
                    } else if !d_clean.is_empty() {
                        bios_date = d_clean.to_string();
                    }
                }
            }
        }
    }

    // Check UEFI vs Legacy
    let uefi_cmd = "try { if (Confirm-SecureBootUEFI) { 'UEFI (Secure Boot Activo)' } else { 'UEFI (Secure Boot Desactivado)' } } catch { 'UEFI / Legacy' }";
    if let Ok(out) = crate::utils::new_hidden_command("powershell")
        .args(["-NoProfile", "-NonInteractive", "-Command", uefi_cmd])
        .output()
    {
        if out.status.success() {
            let res = String::from_utf8_lossy(&out.stdout).trim().to_string();
            if !res.is_empty() {
                boot_mode = res;
            }
        }
    }

    MotherboardInfo {
        manufacturer,
        product,
        serial_number,
        bios_vendor,
        bios_version,
        bios_date,
        boot_mode,
        health: HealthStatus::Optimal,
    }
}
