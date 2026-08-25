// attribute-category.ts
import {
  Layers,
  Smartphone,
  Cpu,
  Monitor,
  Headphones,
  Gamepad2,
  PlugZap,
  FolderKanban,
} from 'lucide-react';

export interface AttributeSelectorItem {
  id: string;
  key: string;
  label: string;
  type: string;
  unit?: string | null;
  options?: unknown[];
}

export interface AttributeCategory {
  id: string;
  label: string;
  icon: any;
  color: string;
  bg: string;
  border: string;
}

// 🎨 دسته‌بندی‌ها با رنگ و آیکون اختصاصی
export const CATEGORIES: AttributeCategory[] = [
  {
    id: 'all',
    label: 'همه مشخصه‌ها',
    icon: Layers,
    color: 'text-slate-500',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/30',
  },
  {
    id: 'mobile',
    label: 'موبایل و تبلت',
    icon: Smartphone,
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
  },
  {
    id: 'computer',
    label: 'لپ‌تاپ و قطعات',
    icon: Cpu,
    color: 'text-indigo-500',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
  },
  {
    id: 'display',
    label: 'نمایشگر و تلویزیون',
    icon: Monitor,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
  {
    id: 'audio',
    label: 'صدا و هدفون',
    icon: Headphones,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
  {
    id: 'gaming',
    label: 'گیمینگ و دوربین',
    icon: Gamepad2,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
  },
  {
    id: 'accessories',
    label: 'لوازم جانبی و شبکه',
    icon: PlugZap,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
  },
  {
    id: 'other',
    label: 'سایر موارد',
    icon: FolderKanban,
    color: 'text-gray-400',
    bg: 'bg-gray-400/10',
    border: 'border-gray-400/30',
  },
];

// 🧠 تشخیص دسته بر اساس کلید مشخصه
export function getCategory(attr: AttributeSelectorItem): string {
  const key = attr.key.toLowerCase();

  // موبایل و تبلت
  if (
    key.includes('mobile') ||
    key.includes('phone') ||
    key.includes('tablet') ||
    key.includes('sim') ||
    key.includes('esim') ||
    key.includes('screen_size') ||
    key.includes('battery_capacity') ||
    key.includes('fast_charging') ||
    key.includes('wired_charging') ||
    key.includes('wireless_charging') ||
    key.includes('reverse_charging') ||
    key.includes('selfie') ||
    key.includes('fingerprint') ||
    key.includes('face_unlock') ||
    key.includes('stylus') ||
    key.includes('pen_') ||
    key.includes('kickstand') ||
    key.includes('main_camera') ||
    key.includes('ultrawide') ||
    key.includes('telephoto') ||
    key.includes('macro_camera') ||
    key.includes('depth_sensor') ||
    key.includes('optical_zoom') ||
    key.includes('digital_zoom') ||
    key.includes('water_resistance') ||
    key.includes('build_material') ||
    key.includes('accelerometer') ||
    key.includes('gyroscope') ||
    key.includes('proximity') ||
    key.includes('ambient_light') ||
    key.includes('compass') ||
    key.includes('barometer') ||
    key.includes('dolby_atmos') ||
    key.includes('stereo_speakers')
  ) {
    return 'mobile';
  }

  // کامپیوتر (لپ‌تاپ، قطعات)
  if (
    key.includes('cpu') ||
    key.includes('processor') ||
    key.includes('gpu') ||
    key.includes('ram') ||
    key.includes('motherboard') ||
    key.includes('ssd') ||
    key.includes('hdd') ||
    key.includes('storage') ||
    key.includes('keyboard') ||
    key.includes('touchpad') ||
    key.includes('webcam') ||
    (key.includes('battery') && !key.includes('capacity')) ||
    key.includes('cooling') ||
    key.includes('thermal') ||
    key.includes('tpm') ||
    key.includes('kensington') ||
    key.includes('convertible') ||
    key.includes('usage') ||
    key.includes('socket') ||
    key.includes('chipset') ||
    key.includes('memory') ||
    key.includes('pcie') ||
    key.includes('m2_slots') ||
    key.includes('sata') ||
    key.includes('cuda') ||
    key.includes('tensor') ||
    key.includes('rt_cores') ||
    key.includes('memory_bus') ||
    key.includes('memory_bandwidth') ||
    key.includes('power_connectors') ||
    key.includes('recommended_psu') ||
    key.includes('cooler') ||
    key.includes('radiator') ||
    key.includes('fan_') ||
    key.includes('rpm') ||
    key.includes('airflow') ||
    key.includes('noise_level') ||
    key.includes('psu') ||
    key.includes('modular') ||
    key.includes('case_type') ||
    key.includes('expansion_slots') ||
    key.includes('front_io') ||
    key.includes('side_panel')
  ) {
    return 'computer';
  }

  // نمایشگر و تلویزیون
  if (
    key.includes('monitor') ||
    key.includes('panel') ||
    key.includes('tv') ||
    key.includes('display') ||
    key.includes('curved') ||
    key.includes('curvature') ||
    key.includes('response_time') ||
    key.includes('contrast_ratio') ||
    key.includes('viewing_angle') ||
    key.includes('hdr') ||
    key.includes('dolby_vision') ||
    key.includes('adaptive_sync') ||
    key.includes('freesync') ||
    key.includes('g_sync') ||
    key.includes('low_blue_light') ||
    key.includes('flicker_free') ||
    key.includes('vesa') ||
    key.includes('height_adjustable') ||
    key.includes('pivot') ||
    key.includes('tilt') ||
    key.includes('swivel') ||
    key.includes('usb_hub') ||
    key.includes('kvm') ||
    key.includes('pip_pbp') ||
    key.includes('smart_tv') ||
    (key.includes('operating_system') && key.includes('tv')) ||
    key.includes('local_dimming') ||
    key.includes('dimming_zones') ||
    key.includes('motion_rate') ||
    key.includes('input_lag') ||
    key.includes('game_mode') ||
    key.includes('vrr') ||
    key.includes('allm') ||
    key.includes('hdmi_2_1') ||
    key.includes('earc') ||
    key.includes('voice_assistant') ||
    key.includes('tuner') ||
    key.includes('sound_output') ||
    key.includes('subwoofer')
  ) {
    return 'display';
  }

  // صدا و هدفون
  if (
    key.includes('headphone') ||
    key.includes('speaker') ||
    key.includes('audio') ||
    key.includes('anc') ||
    key.includes('driver') ||
    key.includes('impedance') ||
    key.includes('frequency_response') ||
    key.includes('sensitivity') ||
    key.includes('transparency') ||
    key.includes('spatial_audio') ||
    key.includes('multipoint') ||
    key.includes('charging_time') ||
    (key.includes('quick_charge') && key.includes('headphone')) ||
    key.includes('foldable') ||
    key.includes('detachable_cable') ||
    key.includes('carrying_case') ||
    key.includes('waterproof') ||
    key.includes('sound') ||
    key.includes('noise') ||
    key.includes('subwoofer') ||
    key.includes('mic') ||
    key.includes('codec') ||
    key.includes('aux_input') ||
    key.includes('optical_input') ||
    key.includes('smart_features') ||
    key.includes('multi_room') ||
    key.includes('portable')
  ) {
    return 'audio';
  }

  // گیمینگ و دوربین
  if (
    key.includes('console') ||
    key.includes('controller') ||
    key.includes('platform') ||
    key.includes('ray_tracing') ||
    key.includes('dlss') ||
    key.includes('fsr') ||
    key.includes('xess') ||
    key.includes('optical_drive') ||
    key.includes('backward') ||
    key.includes('max_resolution') ||
    key.includes('max_fps') ||
    (key.includes('sensor_type') && (key.includes('camera') || key.includes('mouse'))) ||
    key.includes('dpi') ||
    key.includes('polling_rate') ||
    key.includes('programmable_buttons') ||
    key.includes('rgb_lighting') ||
    key.includes('wireless_type') ||
    key.includes('switch_type') ||
    key.includes('hot_swappable') ||
    key.includes('keycaps') ||
    key.includes('anti_ghosting') ||
    key.includes('n_key_rollover') ||
    key.includes('macro_keys') ||
    key.includes('wrist_rest') ||
    key.includes('camera_type') ||
    key.includes('sensor_size') ||
    key.includes('megapixels') ||
    key.includes('iso_range') ||
    key.includes('mount') ||
    key.includes('lens_mount') ||
    key.includes('focal_length') ||
    key.includes('aperture') ||
    key.includes('optical_stabilization') ||
    key.includes('viewfinder') ||
    key.includes('autofocus_points') ||
    key.includes('continuous_shooting') ||
    key.includes('shutter_speed') ||
    key.includes('raw_support') ||
    key.includes('video_4k') ||
    key.includes('video_8k') ||
    key.includes('slow_motion') ||
    key.includes('log_profile') ||
    key.includes('external_mic') ||
    key.includes('headphone_monitoring')
  ) {
    return 'gaming';
  }

  // لوازم جانبی و شبکه
  if (
    key.includes('charger') ||
    key.includes('powerbank') ||
    key.includes('output') ||
    key.includes('port_count') ||
    key.includes('usb') ||
    key.includes('power_delivery') ||
    key.includes('pd_power') ||
    key.includes('quick_charge_support') ||
    key.includes('gan') ||
    (key.includes('capacity') && key.includes('powerbank')) ||
    key.includes('input_power') ||
    key.includes('pass_through') ||
    key.includes('led_indicator') ||
    key.includes('router') ||
    key.includes('wifi') ||
    key.includes('ethernet') ||
    key.includes('frequency_bands') ||
    key.includes('antennas') ||
    key.includes('wan_port') ||
    key.includes('mesh') ||
    key.includes('mu_mimo') ||
    key.includes('beamforming') ||
    key.includes('qos') ||
    key.includes('vpn') ||
    key.includes('parental_control') ||
    key.includes('guest_network') ||
    key.includes('drive_type') ||
    key.includes('form_factor') ||
    key.includes('interface') ||
    key.includes('read_speed') ||
    key.includes('write_speed') ||
    key.includes('random_read') ||
    key.includes('random_write') ||
    key.includes('nand_type') ||
    key.includes('dram_cache') ||
    key.includes('tbw') ||
    key.includes('mtbf') ||
    key.includes('encryption') ||
    key.includes('speed_class') ||
    key.includes('uhs_class') ||
    key.includes('video_speed_class') ||
    key.includes('printer') ||
    key.includes('print_') ||
    key.includes('scanner') ||
    key.includes('copier') ||
    key.includes('fax') ||
    key.includes('adf') ||
    key.includes('paper_capacity') ||
    key.includes('monthly_duty_cycle') ||
    key.includes('connectivity')
  ) {
    return 'accessories';
  }

  return 'other';
}
