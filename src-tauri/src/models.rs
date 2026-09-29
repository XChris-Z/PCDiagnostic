use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "UPPERCASE")]
pub enum HealthStatus {
    Optimal,
    Warning,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CpuInfo {
    pub model: String,
    pub vendor: String,
    pub architecture: String,
    pub physical_cores: usize,
    pub logical_cores: usize,
    pub base_clock_mhz: u64,
    pub current_clock_mhz: u64,
    pub total_usage_pct: f32,
    pub per_core_usage: Vec<f32>,
    pub temperature_c: Option<f32>,
    pub health: HealthStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MotherboardInfo {
    pub manufacturer: String,
    pub product: String,
    pub serial_number: String,
    pub bios_vendor: String,
    pub bios_version: String,
    pub bios_date: String,
    pub boot_mode: String,
    pub health: HealthStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RamSlot {
    pub locator: String,
    pub manufacturer: String,
    pub capacity_gb: f64,
    pub speed_mhz: u32,
    pub memory_type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RamInfo {
    pub total_gb: f64,
    pub used_gb: f64,
    pub available_gb: f64,
    pub usage_pct: f32,
    pub swap_total_gb: f64,
    pub swap_used_gb: f64,
    pub slots: Vec<RamSlot>,
    pub consistency_test_passed: bool,
    pub memory_speed_mb_s: f64,
    pub health: HealthStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiskInfo {
    pub name: String,
    pub mount_point: String,
    pub total_gb: f64,
    pub free_gb: f64,
    pub used_pct: f32,
    pub file_system: String,
    pub media_type: String,
    pub bus_type: String,
    pub is_removable: bool,
    pub smart_status: String,
    pub power_on_hours: Option<u64>,
    pub wear_level_pct: Option<f32>,
    pub temperature_c: Option<f32>,
    pub health: HealthStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GpuInfo {
    pub name: String,
    pub is_dedicated: bool,
    pub driver_version: String,
    pub vram_total_mb: u64,
    pub vram_used_mb: Option<u64>,
    pub temperature_c: Option<f32>,
    pub utilization_pct: Option<f32>,
    pub video_processor: String,
    pub health: HealthStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BatteryInfo {
    pub is_laptop: bool,
    pub is_charging: bool,
    pub charge_pct: u32,
    pub design_capacity_mwh: Option<u64>,
    pub full_charge_capacity_mwh: Option<u64>,
    pub wear_level_pct: Option<f32>,
    pub estimated_runtime_min: Option<u32>,
    pub cycle_count: Option<u32>,
    pub health: HealthStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkInterface {
    pub name: String,
    pub mac_address: String,
    pub ip_address: String,
    pub is_up: bool,
    pub received_mb: f64,
    pub transmitted_mb: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OsSecurityInfo {
    pub os_name: String,
    pub os_version: String,
    pub build_number: String,
    pub architecture: String,
    pub uptime_formatted: String,
    pub uptime_seconds: u64,
    pub is_admin: bool,
    pub antivirus_name: String,
    pub antivirus_active: bool,
    pub firewall_active: bool,
    pub tpm_status: String,
    pub secure_boot: String,
    pub health: HealthStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogEntry {
    pub timestamp: String,
    pub level: String,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TechnicalRecommendation {
    pub component: String,
    pub severity: HealthStatus,
    pub title: String,
    pub description: String,
    pub action: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScoreCategory {
    pub name: String,
    pub max_points: u32,
    pub score: u32,
    pub deduction: u32,
    pub status: HealthStatus,
    pub details: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScoreBreakdown {
    pub total_score: u32,
    pub categories: Vec<ScoreCategory>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemDiagnostics {
    pub report_id: String,
    pub timestamp: String,
    pub hostname: String,
    pub health_score: u32,
    pub health_status: HealthStatus,
    pub is_admin: bool,
    pub is_portable: bool,
    pub cpu: CpuInfo,
    pub motherboard: MotherboardInfo,
    pub ram: RamInfo,
    pub storage: Vec<DiskInfo>,
    pub gpus: Vec<GpuInfo>,
    pub battery: Option<BatteryInfo>,
    pub network: Vec<NetworkInterface>,
    pub security: OsSecurityInfo,
    pub diagnostic_log: Vec<LogEntry>,
    pub recommendations: Vec<TechnicalRecommendation>,
    pub score_breakdown: ScoreBreakdown,
    pub client_name: Option<String>,
    pub technician_name: Option<String>,
    pub custom_pc_name: Option<String>,
    pub service_notes: Option<String>,
}
