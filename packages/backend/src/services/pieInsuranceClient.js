import { config } from '../config/env.js';

// TODO: Implement Pie Insurance Workers' Compensation API integration
// Docs: https://docs.pieinsurance.com/
// Pie Insurance specializes in workers' compensation for small businesses.
// Integration requires:
//   1. API key authentication
//   2. Partner ID in all requests
//   3. Submit employer data, payroll, and class codes
//   4. Receive bindable WC quote

const PIE_BASE_URL = config.pieInsurance.baseUrl;
const PIE_API_KEY = config.pieInsurance.apiKey;
const PIE_PARTNER_ID = config.pieInsurance.partnerId;

/**
 * Requests a Workers' Compensation quote from Pie Insurance.
 *
 * TODO: Implement once Pie Insurance API credentials are provisioned.
 *
 * Expected request body:
 *   - partnerId
 *   - businessName, address, state
 *   - FEIN
 *   - classCode (WC class code from carrierFields.wcClassCode)
 *   - estimatedPayroll
 *   - numberOfEmployees
 *   - yearsInBusiness
 *   - effectiveDate
 *
 * @param {Object} carrierFields - Mapped carrier fields from fieldMapper
 * @returns {Promise<{status: string, message: string}>}
 */
export async function getWCQuote(carrierFields) {
  // TODO: Replace stub with actual API call
  // const body = {
  //   partnerId: PIE_PARTNER_ID,
  //   businessName: carrierFields.businessName,
  //   state: carrierFields.mailingAddress.state,
  //   classCode: carrierFields.wcClassCode,
  //   estimatedAnnualPayroll: carrierFields.estimatedPayroll,
  //   numberOfEmployees: carrierFields.numberOfEmployees,
  //   yearsInBusiness: carrierFields.yearsInBusiness,
  //   effectiveDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
  // };
  //
  // const response = await fetch(`${PIE_BASE_URL}/quotes`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'X-Api-Key': PIE_API_KEY,
  //   },
  //   body: JSON.stringify(body),
  // });

  console.info('[PieInsuranceClient] getWCQuote called — integration pending');

  return {
    status: 'not_configured',
    message: 'Pie Insurance integration pending',
  };
}

/**
 * Binds (purchases) a Workers' Compensation policy from Pie Insurance.
 *
 * TODO: Implement once Pie Insurance API credentials are provisioned.
 *
 * @param {string} quoteId - The Pie Insurance quote ID to bind
 * @param {Object} paymentInfo - Payment method details
 * @param {string} paymentInfo.paymentMethodToken - Tokenized payment method
 * @returns {Promise<{status: string, message: string}>}
 */
export async function bindWCPolicy(quoteId, paymentInfo) {
  // TODO: Replace stub with actual API call
  // const body = {
  //   quoteId,
  //   partnerId: PIE_PARTNER_ID,
  //   paymentMethodToken: paymentInfo.paymentMethodToken,
  // };
  //
  // const response = await fetch(`${PIE_BASE_URL}/policies`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'X-Api-Key': PIE_API_KEY,
  //   },
  //   body: JSON.stringify(body),
  // });

  console.info('[PieInsuranceClient] bindWCPolicy called — integration pending');

  return {
    status: 'not_configured',
    message: 'Pie Insurance integration pending',
  };
}
