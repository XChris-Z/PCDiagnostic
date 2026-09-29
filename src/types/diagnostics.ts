export type HealthStatus = 'OPTIMAL' | 'WARNING' | 'CRITICAL';

export interface CpuInfo {
  model: string;
  vendor: string;
  architecture: string;
  physical_cores: number;
  logical_cores: number;
  base_clock_mhz: number;
  current_clock_mhz: number;
  total_usage_pct: number;
  per_core_usage: number[];
  temperature_c: number | null;
  health: HealthStatus;
}

export interface MotherboardInfo {
  manufacturer: string;
  product: string;
  serial_number: string;
  bios_vendor: string;
  bios_version: string;
  bios_date: string;
  boot_mode: string;
  health: HealthStatus;
}

export interface RamSlot {
  locator: string;
  manufacturer: string;
  capacity_gb: number;
  speed_mhz: number;
  memory_type: string;
}

export interface RamInfo {
  total_gb: number;
  used_gb: number;
  available_gb: number;
  usage_pct: number;
  swap_total_gb: number;
  swap_used_gb: number;
  slots: RamSlot[];
  consistency_test_passed: boolean;
  memory_speed_mb_s: number;
  health: HealthStatus;
}

export interface DiskInfo {
  name: string;
  mount_point: string;
  total_gb: number;
  free_gb: number;
  used_pct: number;
  file_system: string;
  media_type: string;
  bus_type: string;
  is_removable: boolean;
  smart_status: string;
  power_on_hours: number | null;
  wear_level_pct: number | null;
  temperature_c: number | null;
  health: HealthStatus;
}

export interface GpuInfo {
  name: string;
  is_dedicated: boolean;
  driver_version: string;
  vram_total_mb: number;
  vram_used_mb: number | null;
  temperature_c: number | null;
  utilization_pct: number | null;
  video_processor: string;
  health: HealthStatus;
}

export interface BatteryInfo {
  is_laptop: boolean;
  is_charging: boolean;
  charge_pct: number;
  design_capacity_mwh: number | null;
  full_charge_capacity_mwh: number | null;
  wear_level_pct: number | null;
  estimated_runtime_min: number | null;
  cycle_count: number | null;
  health: HealthStatus;
}

export interface NetworkInterface {
  name: string;
  mac_address: string;
  ip_address: string;
  is_up: boolean;
  received_mb: number;
  transmitted_mb: number;
}

export interface OsSecurityInfo {
  os_name: string;
  os_version: string;
  build_number: string;
  architecture: string;
  uptime_formatted: string;
  uptime_seconds: number;
  is_admin: boolean;
  antivirus_name: string;
  antivirus_active: boolean;
  firewall_active: boolean;
  tpm_status: string;
  secure_boot: string;
  health: HealthStatus;
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
}

export interface TechnicalRecommendation {
  component: string;
  severity: HealthStatus;
  title: string;
  description: string;
  action: string;
}

export interface ScoreCategory {
  name: string;
  max_points: number;
  score: number;
  deduction: number;
  status: HealthStatus;
  details: string;
}

export interface ScoreBreakdown {
  total_score: number;
  categories: ScoreCategory[];
}

export interface SystemDiagnostics {
  report_id: string;
  timestamp: string;
  hostname: string;
  health_score: number;
  health_status: HealthStatus;
  is_admin: boolean;
  is_portable: boolean;
  cpu: CpuInfo;
  motherboard: MotherboardInfo;
  ram: RamInfo;
  storage: DiskInfo[];
  gpus: GpuInfo[];
  battery: BatteryInfo | null;
  network: NetworkInterface[];
  security: OsSecurityInfo;
  diagnostic_log: LogEntry[];
  recommendations: TechnicalRecommendation[];
  score_breakdown: ScoreBreakdown;
  client_name?: string | null;
  technician_name?: string | null;
  custom_pc_name?: string | null;
  service_notes?: string | null;
}
