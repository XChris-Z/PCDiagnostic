pub mod battery;
pub mod cpu;
pub mod evaluator;
pub mod gpu;
pub mod memory;
pub mod motherboard;
pub mod network;
pub mod security;
pub mod storage;

use crate::models::{LogEntry, SystemDiagnostics};
use chrono::Local;
use sysinfo::System;

pub fn perform_full_diagnostic() -> SystemDiagnostics {
    let mut log = Vec::new();
    let now = || Local::now().format("%H:%M:%S%.3f").to_string();

    log.push(LogEntry {
        timestamp: now(),
        level: "INFO".to_string(),
        message: "Iniciando suite de diagnóstico OmniCheck PC v1.0.0...".to_string(),
    });

    let mut system = System::new();

    log.push(LogEntry {
        timestamp: now(),
        level: "INFO".to_string(),
        message: "Escaneando topología de CPU y núcleos lógicos/físicos...".to_string(),
    });
    let cpu_info = cpu::collect_cpu_info(&mut system);
    log.push(LogEntry {
        timestamp: now(),
        level: "SUCCESS".to_string(),
        message: format!(
            "CPU detectada: {} ({} núcleos físicos / {} hilos)",
            cpu_info.model, cpu_info.physical_cores, cpu_info.logical_cores
        ),
    });

    log.push(LogEntry {
        timestamp: now(),
        level: "INFO".to_string(),
        message: "Leyendo bancos de memoria RAM y ejecutando prueba de consistencia...".to_string(),
    });
    let ram_info = memory::collect_memory_info(&mut system);
    log.push(LogEntry {
        timestamp: now(),
        level: "SUCCESS".to_string(),
        message: format!(
            "RAM verificada: {:.1} GB ({:.1}% en uso). Bandwidth: {:.1} MB/s. Integridad: {}",
            ram_info.total_gb,
            ram_info.usage_pct,
            ram_info.memory_speed_mb_s,
            if ram_info.consistency_test_passed { "OK" } else { "ERROR" }
        ),
    });

    log.push(LogEntry {
        timestamp: now(),
        level: "INFO".to_string(),
        message: "Inspeccionando Placa Base y firmware BIOS (SMBIOS/CIM)...".to_string(),
    });
    let mb_info = motherboard::collect_motherboard_info();
    log.push(LogEntry {
        timestamp: now(),
        level: "SUCCESS".to_string(),
        message: format!("Motherboard: {} {} | BIOS: {}", mb_info.manufacturer, mb_info.product, mb_info.bios_version),
    });

    log.push(LogEntry {
        timestamp: now(),
        level: "INFO".to_string(),
        message: "Analizando unidades de almacenamiento, particiones y telemetría SMART...".to_string(),
    });
    let storage_info = storage::collect_storage_info();
    log.push(LogEntry {
        timestamp: now(),
        level: "SUCCESS".to_string(),
        message: format!("{} unidad(es) de almacenamiento detectada(s) y verificada(s).", storage_info.len()),
    });

    log.push(LogEntry {
        timestamp: now(),
        level: "INFO".to_string(),
        message: "Detectando aceleradores gráficos (GPU Dedicada vs. Integrada)...".to_string(),
    });
    let gpu_info = gpu::collect_gpu_info();
    for g in &gpu_info {
        log.push(LogEntry {
            timestamp: now(),
            level: "SUCCESS".to_string(),
            message: format!(
                "GPU {}: {} (VRAM: {} MB{})",
                if g.is_dedicated { "[Dedicada]" } else { "[Integrada]" },
                g.name,
                g.vram_total_mb,
                g.temperature_c.map(|t| format!(", Temp: {:.1}°C", t)).unwrap_or_default()
            ),
        });
    }

    log.push(LogEntry {
        timestamp: now(),
        level: "INFO".to_string(),
        message: "Evaluando subsistema de energía y batería (Modo Desktop/Laptop)...".to_string(),
    });
    let battery_info = battery::collect_battery_info();
    if let Some(ref b) = battery_info {
        log.push(LogEntry {
            timestamp: now(),
            level: "SUCCESS".to_string(),
            message: format!(
                "Batería detectada (Laptop): Carga: {}%, Desgaste (Wear): {}%",
                b.charge_pct,
                b.wear_level_pct.map(|w| format!("{:.1}", w)).unwrap_or_else(|| "N/A".to_string())
            ),
        });
    } else {
        log.push(LogEntry {
            timestamp: now(),
            level: "INFO".to_string(),
            message: "Equipo de escritorio (Desktop / Sin Batería) identificado. Módulo de batería omitido con éxito.".to_string(),
        });
    }

    log.push(LogEntry {
        timestamp: now(),
        level: "INFO".to_string(),
        message: "Comprobando adaptadores de red y asignaciones IP...".to_string(),
    });
    let net_info = network::collect_network_info();

    log.push(LogEntry {
        timestamp: now(),
        level: "INFO".to_string(),
        message: "Comprobando seguridad del SO, Antivirus, Firewall y privilegios...".to_string(),
    });
    let sec_info = security::collect_security_info(&system);
    log.push(LogEntry {
        timestamp: now(),
        level: "SUCCESS".to_string(),
        message: format!(
            "SO: {} | Uptime: {} | AV: {} | Admin: {}",
            sec_info.os_name, sec_info.uptime_formatted, sec_info.antivirus_name, sec_info.is_admin
        ),
    });

    log.push(LogEntry {
        timestamp: now(),
        level: "INFO".to_string(),
        message: "Calculando índice de salud global y generando informe técnico...".to_string(),
    });
    let (health_score, health_status, recommendations, score_breakdown) = evaluator::evaluate_diagnostics(
        &cpu_info,
        &ram_info,
        &storage_info,
        &gpu_info,
        &mb_info,
        &sec_info,
        &battery_info,
    );
    log.push(LogEntry {
        timestamp: now(),
        level: "SUCCESS".to_string(),
        message: format!("Diagnóstico completado. Score global de salud: {}/100 ({:?})", health_score, health_status),
    });

    let hostname = System::host_name().unwrap_or_else(|| "DESKTOP-OMNICHECK".to_string());
    let report_id = format!("OMNI-{}-{}", Local::now().format("%Y%m%d"), &uuid_like_hash(&hostname));

    SystemDiagnostics {
        report_id,
        timestamp: Local::now().to_rfc3339(),
        hostname,
        health_score,
        health_status,
        is_admin: sec_info.is_admin,
        is_portable: true,
        cpu: cpu_info,
        motherboard: mb_info,
        ram: ram_info,
        storage: storage_info,
        gpus: gpu_info,
        battery: battery_info,
        network: net_info,
        security: sec_info,
        diagnostic_log: log,
        recommendations,
        score_breakdown,
        client_name: None,
        technician_name: None,
        custom_pc_name: None,
        service_notes: None,
    }
}

fn uuid_like_hash(input: &str) -> String {
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};
    let mut hasher = DefaultHasher::new();
    input.hash(&mut hasher);
    let h1 = hasher.finish();
    Local::now().timestamp_nanos_opt().unwrap_or(12345).hash(&mut hasher);
    let h2 = hasher.finish();
    format!("{:04X}-{:04X}", (h1 & 0xFFFF) as u16, (h2 & 0xFFFF) as u16)
}
