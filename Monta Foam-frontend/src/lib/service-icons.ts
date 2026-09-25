import { Snowflake, Thermometer, Factory, Wrench, HardHat, Box } from "lucide-react";

/** Maps a service slug to a representative icon (cold-storage themed, not generic). */
export const SERVICE_ICONS: Record<string, typeof Snowflake> = {
  "cold-storage-rooms": Box,
  "freezing-rooms": Snowflake,
  "industrial-cooling-systems": Factory,
  "maintenance-services": Wrench,
  "installation-services": HardHat,
};

export const getServiceIcon = (slug: string) => SERVICE_ICONS[slug] ?? Thermometer;
