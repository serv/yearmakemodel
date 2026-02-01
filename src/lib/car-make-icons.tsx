import {
  ToyotaIcon,
  HondaIcon,
  FordIcon,
  BMWIcon,
  AudiIcon,
  PorscheIcon,
  LamborghiniIcon,
  FerrariIcon,
  NissanIcon,
  MazdaIcon,
  SubaruIcon,
  VolkswagenIcon,
  HyundaiIcon,
  KiaIcon,
  ChevroletIcon,
  DodgeIcon,
  JeepIcon,
  TeslaIcon,
  RivianIcon,
  AcuraIcon,
  BuickIcon,
  CadillacIcon,
  ChryslerIcon,
  GMCIcon,
  InfinitiIcon,
  LexusIcon,
  LincolnIcon,
  MiniIcon,
  MitsubishiIcon,
  RAMIcon,
  VolvoIcon,
  LandroverIcon,
  MBIcon,
} from "@cardog-icons/react";
import type { ComponentType, SVGProps } from "react";

// Type for the icon components from @cardog-icons/react
type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

/**
 * Maps car make names to their corresponding icon components from @cardog-icons/react
 * Uses the Icon variant for compact display in dropdowns
 * Note: Not all makes have icons available in the library
 */
const MAKE_TO_ICON_COMPONENT: Record<string, IconComponent> = {
  Toyota: ToyotaIcon,
  Honda: HondaIcon,
  Ford: FordIcon,
  BMW: BMWIcon,
  Audi: AudiIcon,
  Porsche: PorscheIcon,
  Lamborghini: LamborghiniIcon,
  Ferrari: FerrariIcon,
  Nissan: NissanIcon,
  Mazda: MazdaIcon,
  Subaru: SubaruIcon,
  Volkswagen: VolkswagenIcon,
  Hyundai: HyundaiIcon,
  Kia: KiaIcon,
  Chevrolet: ChevroletIcon,
  Dodge: DodgeIcon,
  Jeep: JeepIcon,
  Tesla: TeslaIcon,
  Rivian: RivianIcon,
  Acura: AcuraIcon,
  Buick: BuickIcon,
  Cadillac: CadillacIcon,
  Chrysler: ChryslerIcon,
  GMC: GMCIcon,
  Infiniti: InfinitiIcon,
  Lexus: LexusIcon,
  Lincoln: LincolnIcon,
  Mini: MiniIcon,
  Mitsubishi: MitsubishiIcon,
  RAM: RAMIcon,
  Volvo: VolvoIcon,
  "Land Rover": LandroverIcon,
  "Mercedes-Benz": MBIcon,
};

/**
 * Get the car make icon component for a given make name
 * @param make - The car make name (e.g., "Toyota", "Mercedes-Benz")
 * @returns The icon component or null if not found
 */
export function getCarMakeIcon(make: string): IconComponent | null {
  return MAKE_TO_ICON_COMPONENT[make] || null;
}

/**
 * Check if a car make has an icon available
 * @param make - The car make name
 * @returns true if an icon exists, false otherwise
 */
export function hasCarMakeIcon(make: string): boolean {
  return getCarMakeIcon(make) !== null;
}

/**
 * Get all available car make icons
 * @returns Array of make names that have icons
 */
export function getAvailableMakes(): string[] {
  return Object.keys(MAKE_TO_ICON_COMPONENT);
}
