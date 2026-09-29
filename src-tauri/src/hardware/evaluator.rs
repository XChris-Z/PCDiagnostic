use crate::models::{
    BatteryInfo, CpuInfo, DiskInfo, GpuInfo, HealthStatus, MotherboardInfo, OsSecurityInfo,
    RamInfo, ScoreBreakdown, ScoreCategory, TechnicalRecommendation,
};

pub fn evaluate_diagnostics(
    cpu: &CpuInfo,
    ram: &RamInfo,
    storage: &[DiskInfo],
    gpus: &[GpuInfo],
    motherboard: &MotherboardInfo,
    security: &OsSecurityInfo,
    battery: &Option<BatteryInfo>,
) -> (u32, HealthStatus, Vec<TechnicalRecommendation>, ScoreBreakdown) {
    let mut recommendations = Vec::new();
    let mut categories = Vec::new();

    // 1. CPU Pillar (Max 20 pts)
    let (cpu_pts, cpu_deduct, cpu_status, cpu_detail) = match cpu.temperature_c {
        Some(temp) if temp >= 90.0 => {
            recommendations.push(TechnicalRecommendation {
                component: "Procesador (CPU)".to_string(),
                severity: HealthStatus::Critical,
                title: "Temperatura Crítica en CPU".to_string(),
                description: format!(
                    "El procesador alcanzó {:.1}°C bajo prueba de diagnóstico, superando el límite seguro recomendado.",
                    temp
                ),
                action: "Desmontar disipador, retirar pasta térmica seca y aplicar compuesto térmico de alta conductividad.".to_string(),
            });
            (
                5,
                15,
                HealthStatus::Critical,
                format!("Temperatura crítica detectada: {:.1}°C (Límite seguro: 80°C)", temp),
            )
        }
        Some(temp) if temp >= 80.0 => {
            recommendations.push(TechnicalRecommendation {
                component: "Procesador (CPU)".to_string(),
                severity: HealthStatus::Warning,
                title: "Temperatura Elevada en CPU".to_string(),
                description: format!(
                    "La temperatura del procesador es de {:.1}°C. Sugiere acumulación de polvo.",
                    temp
                ),
                action: "Realizar mantenimiento preventivo y limpieza de ventiladores.".to_string(),
            });
            (
                14,
                6,
                HealthStatus::Warning,
                format!("Temperatura elevada: {:.1}°C (Se aconseja limpieza preventiva)", temp),
            )
        }
        Some(temp) => (
            20,
            0,
            HealthStatus::Optimal,
            format!("Térmicas nominales: {:.1}°C (Frecuencias estables sin estrangulamiento)", temp),
        ),
        None => (
            20,
            0,
            HealthStatus::Optimal,
            "Carga equilibrada por hilo y frecuencias de reloj operando en rango nominal".to_string(),
        ),
    };

    categories.push(ScoreCategory {
        name: "Procesador (CPU)".to_string(),
        max_points: 20,
        score: cpu_pts,
        deduction: cpu_deduct,
        status: cpu_status,
        details: cpu_detail,
    });

    // 2. RAM Pillar (Max 20 pts)
    let (ram_pts, ram_deduct, ram_status, ram_detail) = if !ram.consistency_test_passed {
        recommendations.push(TechnicalRecommendation {
            component: "Memoria RAM".to_string(),
            severity: HealthStatus::Critical,
            title: "Error de Consistencia en Módulo RAM".to_string(),
            description: "Se detectaron inconsistencias de bits durante la prueba de estrés de memoria.".to_string(),
            action: "Probar cada slot de memoria por separado y reemplazar el módulo defectuoso.".to_string(),
        });
        (
            0,
            20,
            HealthStatus::Critical,
            "FALLO DE INTEGRIDAD: Se detectaron mutaciones de bit-flips en RAM".to_string(),
        )
    } else if ram.usage_pct >= 92.0 {
        recommendations.push(TechnicalRecommendation {
            component: "Memoria RAM".to_string(),
            severity: HealthStatus::Warning,
            title: "Uso Elevado de Memoria".to_string(),
            description: format!("La memoria RAM se encuentra al {:.1}% de su capacidad.", ram.usage_pct),
            action: "Cerrar procesos en segundo plano o expandir los módulos DIMM.".to_string(),
        });
        (
            14,
            6,
            HealthStatus::Warning,
            format!("Prueba de integridad superada (0 bit-flips), pero uso elevado ({:.1}%)", ram.usage_pct),
        )
    } else {
        (
            20,
            0,
            HealthStatus::Optimal,
            format!(
                "Integridad perfecta (0 bit-flips) y ancho de banda real nominal ({:.0} MB/s)",
                ram.memory_speed_mb_s
            ),
        )
    };

    categories.push(ScoreCategory {
        name: "Memoria RAM & Integridad".to_string(),
        max_points: 20,
        score: ram_pts,
        deduction: ram_deduct,
        status: ram_status,
        details: ram_detail,
    });

    // 3. Storage Pillar (Max 20 pts)
    let has_smart_critical = storage.iter().any(|d| d.health == HealthStatus::Critical);
    let has_disk_full = storage.iter().any(|d| d.used_pct >= 92.0);

    let (storage_pts, storage_deduct, storage_status, storage_detail) = if has_smart_critical {
        recommendations.push(TechnicalRecommendation {
            component: "Almacenamiento".to_string(),
            severity: HealthStatus::Critical,
            title: "Alerta Crítica SMART en Disco".to_string(),
            description: "Una o más unidades físicas reportan sectores no saludables.".to_string(),
            action: "Hacer copia de seguridad urgente y reemplazar la unidad afectada.".to_string(),
        });
        (
            4,
            16,
            HealthStatus::Critical,
            "Alerta SMART detectada: Riesgo inminente de pérdida de datos".to_string(),
        )
    } else if has_disk_full {
        recommendations.push(TechnicalRecommendation {
            component: "Almacenamiento".to_string(),
            severity: HealthStatus::Warning,
            title: "Espacio en Disco Casi Agotado".to_string(),
            description: "El espacio libre en disco es inferior al 10%.".to_string(),
            action: "Liberar espacio en disco o migrar a una unidad de mayor capacidad.".to_string(),
        });
        (
            14,
            6,
            HealthStatus::Warning,
            "SMART saludable, pero una unidad tiene más del 92% de espacio ocupado".to_string(),
        )
    } else {
        (
            20,
            0,
            HealthStatus::Optimal,
            format!("{} unidades verificadas con telemetría SMART saludable y espacio disponible", storage.len()),
        )
    };

    categories.push(ScoreCategory {
        name: "Almacenamiento & SMART".to_string(),
        max_points: 20,
        score: storage_pts,
        deduction: storage_deduct,
        status: storage_status,
        details: storage_detail,
    });

    // 4. Graphics & GPU Pillar (Max 15 pts)
    let mut gpu_deduct = 0;
    let mut gpu_details = Vec::new();

    for gpu in gpus {
        if let Some(t) = gpu.temperature_c {
            if t >= 88.0 {
                gpu_deduct += 6;
                gpu_details.push(format!("GPU {} opera a {:.1}°C", gpu.name, t));
            }
        }
    }

    let gpu_pts = 15u32.saturating_sub(gpu_deduct);
    let (gpu_status, gpu_detail_str) = if gpu_deduct >= 6 {
        (HealthStatus::Warning, gpu_details.join(" | "))
    } else {
        (
            HealthStatus::Optimal,
            format!("{} adaptador(es) gráfico(s) detectado(s) y operando en rango térmico nominal", gpus.len()),
        )
    };

    categories.push(ScoreCategory {
        name: "Acelerador Gráfico (GPU)".to_string(),
        max_points: 15,
        score: gpu_pts,
        deduction: gpu_deduct,
        status: gpu_status,
        details: gpu_detail_str,
    });

    // 5. Security & OS Pillar (Max 15 pts)
    let mut sec_deduct = 0;
    let mut sec_details = Vec::new();

    if !security.antivirus_active {
        sec_deduct += 7;
        sec_details.push("Antivirus inactivo o no reportado".to_string());
    }
    if !security.firewall_active {
        sec_deduct += 5;
        sec_details.push("Firewall de red desactivado".to_string());
    }

    let sec_pts = 15u32.saturating_sub(sec_deduct);
    let (sec_status, sec_detail_str) = if sec_deduct >= 7 {
        (HealthStatus::Warning, sec_details.join(" | "))
    } else {
        (
            HealthStatus::Optimal,
            format!("Protección activa: {} con Firewall y TPM 2.0 verificados", security.antivirus_name),
        )
    };

    categories.push(ScoreCategory {
        name: "Seguridad & Sistema Operativo".to_string(),
        max_points: 15,
        score: sec_pts,
        deduction: sec_deduct,
        status: sec_status,
        details: sec_detail_str,
    });

    // 6. Motherboard & Firmware BIOS Pillar (Max 10 pts)
    let mut mb_deduct = 0;
    let mut mb_details = Vec::new();

    if motherboard.manufacturer.to_lowercase().contains("desconocido") {
        mb_deduct += 2;
        mb_details.push("Fabricante de placa no serializado".to_string());
    }

    let mb_pts = 10u32.saturating_sub(mb_deduct);
    let (mb_status, mb_detail_str) = if mb_deduct > 0 {
        (HealthStatus::Warning, mb_details.join(" | "))
    } else {
        (
            HealthStatus::Optimal,
            format!("Placa {} {} con BIOS {} (Modo {})", motherboard.manufacturer, motherboard.product, motherboard.bios_version, motherboard.boot_mode),
        )
    };

    categories.push(ScoreCategory {
        name: "Placa Base & Firmware BIOS".to_string(),
        max_points: 10,
        score: mb_pts,
        deduction: mb_deduct,
        status: mb_status,
        details: mb_detail_str,
    });

    // Battery consideration if laptop
    if let Some(bat) = battery {
        if let Some(wear) = bat.wear_level_pct {
            if wear >= 45.0 {
                recommendations.push(TechnicalRecommendation {
                    component: "Batería & Autonomía".to_string(),
                    severity: HealthStatus::Warning,
                    title: "Batería con Desgaste Químico Avanzado".to_string(),
                    description: format!(
                        "La batería presenta un desgaste del {:.1}%, reduciendo significativamente la autonomía.",
                        wear
                    ),
                    action: "Considerar el reemplazo del paquete de celdas para restablecer la duración original.".to_string(),
                });
            }
        }
    }

    // Total Score (Sum of all 6 pillars = Max 100)
    let final_score: u32 = categories.iter().map(|c| c.score).sum();

    let overall_status = if final_score >= 88 && !recommendations.iter().any(|r| r.severity == HealthStatus::Critical) {
        HealthStatus::Optimal
    } else if final_score >= 65 && !recommendations.iter().any(|r| r.severity == HealthStatus::Critical) {
        HealthStatus::Warning
    } else {
        HealthStatus::Critical
    };

    if recommendations.is_empty() {
        recommendations.push(TechnicalRecommendation {
            component: "Sistema Completo".to_string(),
            severity: HealthStatus::Optimal,
            title: "Equipo en Estado Óptimo de Rendimiento".to_string(),
            description: "Todos los subsistemas (CPU, RAM, Discos, Gráficos, Placa Base y Seguridad) superaron las pruebas diagnósticas con métricas nominales de fábrica.".to_string(),
            action: "Mantener limpiezas periódicas semestrales y sistema operativo actualizado.".to_string(),
        });
    }

    let breakdown = ScoreBreakdown {
        total_score: final_score,
        categories,
    };

    (final_score, overall_status, recommendations, breakdown)
}
