use crate::models::{HealthStatus, OsSecurityInfo};
use sysinfo::System;

pub fn collect_security_info(_system: &System) -> OsSecurityInfo {
    let os_name = System::name().unwrap_or_else(|| "Microsoft Windows".to_string());
    let os_version = System::os_version().unwrap_or_else(|| "11".to_string());
    let kernel_version = System::kernel_version().unwrap_or_else(|| "10.0".to_string());
    let architecture = std::env::consts::ARCH.to_string();

    let uptime_seconds = System::uptime();
    let days = uptime_seconds / 86400;
    let hours = (uptime_seconds % 86400) / 3600;
    let minutes = (uptime_seconds % 3600) / 60;
    let uptime_formatted = format!("{}d {}h {}m", days, hours, minutes);

    let is_admin = check_if_admin();

    let (antivirus_name, antivirus_active) = query_antivirus();
    let firewall_active = query_firewall();

    // Query TPM and Secure Boot via PnP & UEFI
    let (tpm_status, secure_boot) = query_tpm_and_secureboot();

    let health = if !antivirus_active && !firewall_active {
        HealthStatus::Warning
    } else {
        HealthStatus::Optimal
    };

    OsSecurityInfo {
        os_name,
        os_version: format!("Windows (Kernel {})", kernel_version),
        build_number: os_version,
        architecture,
        uptime_formatted,
        uptime_seconds,
        is_admin,
        antivirus_name,
        antivirus_active,
        firewall_active,
        tpm_status,
        secure_boot,
        health,
    }
}

fn check_if_admin() -> bool {
    let output = crate::utils::new_hidden_command("net")
        .arg("session")
        .output();

    match output {
        Ok(out) => out.status.success(),
        Err(_) => false,
    }
}

fn query_antivirus() -> (String, bool) {
    let cmd = "Get-CimInstance -Namespace root/SecurityCenter2 -ClassName AntiVirusProduct -ErrorAction SilentlyContinue | Select-Object -First 1 displayName, productState | ConvertTo-Json -Compress";

    if let Ok(out) = crate::utils::new_hidden_command("powershell")
        .args(["-NoProfile", "-NonInteractive", "-Command", cmd])
        .output()
    {
        if out.status.success() {
            let json_str = String::from_utf8_lossy(&out.stdout);
            if let Ok(val) = serde_json::from_str::<serde_json::Value>(&json_str) {
                if let Some(name) = val["displayName"].as_str() {
                    return (name.to_string(), true);
                }
            }
        }
    }

    ("Windows Defender / Antivirus del Sistema".to_string(), true)
}

fn query_firewall() -> bool {
    let cmd = "(Get-NetFirewallProfile -Profile Domain,Public,Private -ErrorAction SilentlyContinue | Where-Object { $_.Enabled -eq $true } | Measure-Object).Count -gt 0";

    if let Ok(out) = crate::utils::new_hidden_command("powershell")
        .args(["-NoProfile", "-NonInteractive", "-Command", cmd])
        .output()
    {
        if out.status.success() {
            return String::from_utf8_lossy(&out.stdout).trim() == "True";
        }
    }

    true
}

fn query_tpm_and_secureboot() -> (String, String) {
    let tpm_cmd = r#"
        $dev = Get-CimInstance Win32_PnPEntity -Filter "PNPClass = 'SecurityDevices'" -ErrorAction SilentlyContinue | Where-Object { $_.Name -like '*2.0*' -or $_.Name -like '*TPM*' -or $_.Name -like '*plataforma*' } | Select-Object -First 1;
        if ($dev) {
            "TPM 2.0 Presente y Listo"
        } else {
            try { $t = Get-Tpm; if ($t.TpmPresent) { "TPM Presente y Listo" } else { "No detectado" } } catch { "Módulo TPM No Reportado" }
        }
    "#;
    let tpm = crate::utils::new_hidden_command("powershell")
        .args(["-NoProfile", "-NonInteractive", "-Command", tpm_cmd])
        .output()
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
        .unwrap_or_else(|_| "TPM 2.0 Presente".to_string());

    let sb_cmd = "try { if (Confirm-SecureBootUEFI) { 'Habilitado' } else { 'Deshabilitado' } } catch { 'UEFI Estándar' }";
    let sb = crate::utils::new_hidden_command("powershell")
        .args(["-NoProfile", "-NonInteractive", "-Command", sb_cmd])
        .output()
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
        .unwrap_or_else(|_| "UEFI Estándar".to_string());

    (tpm, sb)
}
