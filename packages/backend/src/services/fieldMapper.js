import { config } from '../config/env.js';

const REVENUE_MIDPOINTS = {
  under50k: 35_000,
  '50k-100k': 75_000,
  '100k-250k': 175_000,
  '250k-500k': 375_000,
  '500k+': 750_000,
};

const PAYROLL_FACTORS = {
  solo: 0.35,
  '2-5': 0.50,
  '6-10': 0.55,
  '10+': 0.55,
};

const EMPLOYEE_COUNT_MAP = {
  solo: 1,
  '2-5': 3,
  '6-10': 8,
  '10+': 15,
};

const EQUIPMENT_VALUES = {
  'Pressure Washing': 8_000,
  'Soft Washing': 5_000,
  'Roof Cleaning': 6_000,
  'Concrete Cleaning': 7_000,
  'Fleet Washing': 12_000,
  'Window Cleaning': 3_000,
  'Gutter Cleaning': 4_000,
  'House Washing': 6_000,
};

const WINDOW_GUTTER_ONLY = new Set(['Window Cleaning', 'Gutter Cleaning']);

/**
 * Determines the NAICS code based on services offered.
 * 561720 = Janitorial Services (window/gutter cleaning only)
 * 561790 = Other Services to Buildings and Dwellings
 */
function deriveNaicsCode(services) {
  if (!services || services.length === 0) {
    return '561790';
  }
  const allWindowGutter = services.every((s) => WINDOW_GUTTER_ONLY.has(s));
  return allWindowGutter ? '561720' : '561790';
}

/**
 * Calculates total equipment value from selected services.
 */
function calculateEquipmentValue(services) {
  if (!services || services.length === 0) return 0;
  return services.reduce((sum, service) => {
    return sum + (EQUIPMENT_VALUES[service] || 0);
  }, 0);
}

/**
 * Maps intake form answers to ACORD-standard carrier fields.
 *
 * @param {Object} intake - The 8-question intake answers
 * @returns {Object} ACORD-standard carrier fields plus original intake
 */
export function mapIntakeToCarrierFields(intake) {
  const {
    businessName,
    address,
    city,
    state,
    zip,
    contactFirstName,
    contactLastName,
    email,
    phone,
    services = [],
    chemicalsUsed = false,
    employeeCount = 'solo',
    annualRevenue = 'under50k',
    worksAtHeight = false,
    claimsHistory = { hasClaims: false, count: 0 },
  } = intake;

  const revenueMidpoint = REVENUE_MIDPOINTS[annualRevenue] ?? 35_000;
  const payrollFactor = PAYROLL_FACTORS[employeeCount] ?? 0.35;
  const numericEmployees = EMPLOYEE_COUNT_MAP[employeeCount] ?? 1;
  const estimatedPayroll = Math.round(revenueMidpoint * payrollFactor);
  const naicsCode = deriveNaicsCode(services);
  const equipmentValue = calculateEquipmentValue(services);
  const wcClassCode = worksAtHeight ? '5474' : '9014';
  const hasBusinessVehicles = revenueMidpoint > 30_000;
  const servesCommercial =
    revenueMidpoint > 100_000 || services.includes('Fleet Washing');

  return {
    // Original intake preserved
    intake,

    // Business identification
    businessName,
    mailingAddress: {
      street: address,
      city,
      state,
      zip,
    },

    // Contact
    contactFirstName,
    contactLastName,
    contactEmail: email,
    contactPhone: phone,

    // Industry classification
    naicsCode,
    sicCode: null, // Derived by carrier if needed
    classificationDescription: naicsCode === '561720'
      ? 'Janitorial Services'
      : 'Other Services to Buildings and Dwellings',

    // Workforce
    numberOfEmployees: numericEmployees,
    employeeCountRange: employeeCount,
    estimatedPayroll,
    wcClassCode,

    // Financials
    annualRevenue: revenueMidpoint,
    annualRevenueRange: annualRevenue,

    // Equipment & operations
    equipmentValue,
    servicesOffered: services,
    chemicalsUsed,
    worksAtHeight,
    operatingRadiusMiles: 50,
    hasBusinessVehicles,
    servesCommercial,

    // Claims
    claimsHistory,
    priorClaimsCount: claimsHistory.hasClaims ? claimsHistory.count : 0,

    // Defaults
    yearsInBusiness: 3,
    legalEntity: 'LLC', // Most common for exterior cleaning

    // Producer info from config
    producerCode: config.coterie.producerCode,
    producerNPN: config.producer.npn,
    agencyName: config.producer.agencyName,
  };
}
