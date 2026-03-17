/**
 * Service catalog templates per business type.
 * Used during onboarding to pre-fill company_services.
 * Owners can customize after setup.
 */

export const BUSINESS_TYPES = [
  "lawn_care",
  "pool_service",
  "property_cleaning",
  "pressure_washing",
  "pest_control",
  "hvac",
  "window_cleaning",
  "handyman",
  "multi_service",
] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number];

export interface ServiceTemplate {
  readonly name: string;
  readonly defaultPrice: number; // cents
  readonly category: string;
}

export interface BusinessTypeConfig {
  readonly label: string;
  readonly icon: string; // emoji for onboarding UI
  readonly entityLabel: string; // what they call their clients' locations
  readonly services: readonly ServiceTemplate[];
}

export const SERVICE_CATALOG: Record<BusinessType, BusinessTypeConfig> = {
  lawn_care: {
    label: "Lawn Care",
    icon: "🌿",
    entityLabel: "Properties",
    services: [
      { name: "Weekly Mow + Edge", defaultPrice: 6500, category: "Mowing" },
      { name: "Bi-weekly Mow + Edge", defaultPrice: 7500, category: "Mowing" },
      { name: "Full Yard Cleanup", defaultPrice: 15000, category: "Cleanup" },
      { name: "Hedge Trimming", defaultPrice: 9500, category: "Trimming" },
      { name: "Leaf Removal", defaultPrice: 12000, category: "Cleanup" },
      { name: "Aeration + Seeding", defaultPrice: 20000, category: "Turf Care" },
      { name: "Fertilizer Application", defaultPrice: 8500, category: "Turf Care" },
    ],
  },
  pool_service: {
    label: "Pool Service",
    icon: "🏊",
    entityLabel: "Pools",
    services: [
      { name: "Weekly Chemical Balance", defaultPrice: 3500, category: "Chemicals" },
      { name: "Filter Clean", defaultPrice: 7500, category: "Maintenance" },
      { name: "Green-to-Clean", defaultPrice: 25000, category: "Restoration" },
      { name: "Tile & Surface Scrub", defaultPrice: 15000, category: "Cleaning" },
      { name: "Equipment Inspection", defaultPrice: 5000, category: "Maintenance" },
      { name: "Pool Opening (Seasonal)", defaultPrice: 20000, category: "Seasonal" },
      { name: "Pool Closing (Seasonal)", defaultPrice: 18000, category: "Seasonal" },
    ],
  },
  property_cleaning: {
    label: "Property Cleaning",
    icon: "🏠",
    entityLabel: "Units",
    services: [
      { name: "Standard Clean", defaultPrice: 12000, category: "Cleaning" },
      { name: "Deep Clean", defaultPrice: 22000, category: "Cleaning" },
      { name: "Airbnb Turnover", defaultPrice: 15000, category: "Turnover" },
      { name: "Move-out Clean", defaultPrice: 30000, category: "Cleaning" },
      { name: "Post-construction Clean", defaultPrice: 45000, category: "Specialty" },
      { name: "Carpet Shampoo", defaultPrice: 18000, category: "Specialty" },
    ],
  },
  pressure_washing: {
    label: "Pressure Washing",
    icon: "💧",
    entityLabel: "Properties",
    services: [
      { name: "Driveway Wash", defaultPrice: 15000, category: "Concrete" },
      { name: "House Wash (Exterior)", defaultPrice: 25000, category: "Exterior" },
      { name: "Deck / Patio Wash", defaultPrice: 12000, category: "Wood/Stone" },
      { name: "Roof Soft Wash", defaultPrice: 35000, category: "Roof" },
      { name: "Fence Cleaning", defaultPrice: 10000, category: "Exterior" },
      { name: "Pool Deck Wash", defaultPrice: 12000, category: "Concrete" },
    ],
  },
  pest_control: {
    label: "Pest Control",
    icon: "🛡️",
    entityLabel: "Properties",
    services: [
      { name: "General Pest Treatment", defaultPrice: 8000, category: "General" },
      { name: "Termite Inspection", defaultPrice: 10000, category: "Termite" },
      { name: "Mosquito Spray", defaultPrice: 7500, category: "Outdoor" },
      { name: "Rodent Control", defaultPrice: 15000, category: "Rodent" },
      { name: "Bed Bug Treatment", defaultPrice: 50000, category: "Specialty" },
      { name: "Quarterly Prevention Plan", defaultPrice: 12000, category: "Preventive" },
    ],
  },
  hvac: {
    label: "HVAC Service",
    icon: "❄️",
    entityLabel: "Properties",
    services: [
      { name: "AC Tune-Up", defaultPrice: 12000, category: "Maintenance" },
      { name: "Filter Replacement", defaultPrice: 5000, category: "Maintenance" },
      { name: "Duct Cleaning", defaultPrice: 35000, category: "Cleaning" },
      { name: "Diagnostic / Troubleshoot", defaultPrice: 8500, category: "Repair" },
      { name: "Thermostat Install", defaultPrice: 15000, category: "Install" },
      { name: "Refrigerant Recharge", defaultPrice: 20000, category: "Repair" },
    ],
  },
  window_cleaning: {
    label: "Window Cleaning",
    icon: "🪟",
    entityLabel: "Properties",
    services: [
      { name: "Interior Windows", defaultPrice: 15000, category: "Interior" },
      { name: "Exterior Windows", defaultPrice: 18000, category: "Exterior" },
      { name: "Interior + Exterior", defaultPrice: 28000, category: "Full Service" },
      { name: "Screen Cleaning", defaultPrice: 5000, category: "Add-on" },
      { name: "Skylight Cleaning", defaultPrice: 10000, category: "Specialty" },
      { name: "Commercial Storefront", defaultPrice: 8000, category: "Commercial" },
    ],
  },
  handyman: {
    label: "Handyman",
    icon: "🔧",
    entityLabel: "Properties",
    services: [
      { name: "General Repair (1 hr)", defaultPrice: 7500, category: "Repair" },
      { name: "Furniture Assembly", defaultPrice: 10000, category: "Assembly" },
      { name: "Drywall Patch", defaultPrice: 12000, category: "Repair" },
      { name: "Fixture Install (Light/Fan)", defaultPrice: 8500, category: "Install" },
      { name: "Door / Lock Repair", defaultPrice: 9500, category: "Repair" },
      { name: "TV Mounting", defaultPrice: 8000, category: "Install" },
    ],
  },
  multi_service: {
    label: "Multi-Service",
    icon: "⚡",
    entityLabel: "Properties",
    services: [
      // Starter mix of the most common services
      { name: "Lawn Mow + Edge", defaultPrice: 6500, category: "Lawn" },
      { name: "Full Yard Cleanup", defaultPrice: 15000, category: "Lawn" },
      { name: "Pool Chemical Balance", defaultPrice: 3500, category: "Pool" },
      { name: "Standard Clean", defaultPrice: 12000, category: "Cleaning" },
      { name: "Airbnb Turnover", defaultPrice: 15000, category: "Cleaning" },
      { name: "Pressure Wash — Driveway", defaultPrice: 15000, category: "Pressure Washing" },
      { name: "General Repair (1 hr)", defaultPrice: 7500, category: "Handyman" },
    ],
  },
};

/** Get the config for a business type, falling back to lawn_care */
export function getBusinessConfig(type: string): BusinessTypeConfig {
  return SERVICE_CATALOG[type as BusinessType] ?? SERVICE_CATALOG.lawn_care;
}
