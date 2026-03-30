import { config } from '../config/env.js';

// TODO: Implement Bold Penguin Terminal API integration
// Docs: https://developers.boldpenguin.com/
// Bold Penguin provides a multi-carrier quoting marketplace.
// Integration requires:
//   1. OAuth2 authentication with client credentials
//   2. Session creation with pre-filled application data
//   3. Polling or webhook for quote results from multiple carriers

const BP_BASE_URL = config.boldPenguin.baseUrl;
const BP_API_KEY = config.boldPenguin.apiKey;
const BP_AGENT_ID = config.boldPenguin.agentId;

/**
 * Submits a commercial insurance application to Bold Penguin's
 * multi-carrier marketplace.
 *
 * TODO: Implement once Bold Penguin API credentials are provisioned.
 *
 * Expected flow:
 *   1. Create a session with applicant data
 *   2. Bold Penguin fans out to configured carriers
 *   3. Poll or receive webhook with carrier responses
 *
 * @param {Object} carrierFields - Mapped carrier fields from fieldMapper
 * @returns {Promise<{status: string, message: string}>}
 */
export async function submitApplication(carrierFields) {
  // TODO: Replace stub with actual API call
  // const body = {
  //   agentId: BP_AGENT_ID,
  //   businessName: carrierFields.businessName,
  //   address: carrierFields.mailingAddress,
  //   naics: carrierFields.naicsCode,
  //   annualRevenue: carrierFields.annualRevenue,
  //   numberOfEmployees: carrierFields.numberOfEmployees,
  // };
  //
  // const response = await fetch(`${BP_BASE_URL}/sessions`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${BP_API_KEY}`,
  //   },
  //   body: JSON.stringify(body),
  // });

  console.info('[BoldPenguinClient] submitApplication called — integration pending');

  return {
    status: 'not_configured',
    message: 'Bold Penguin integration pending',
  };
}

/**
 * Retrieves available quotes for a previously submitted Bold Penguin application.
 *
 * TODO: Implement once Bold Penguin API credentials are provisioned.
 *
 * @param {string} applicationId - The Bold Penguin session/application ID
 * @returns {Promise<{status: string, message: string}>}
 */
export async function getQuotes(applicationId) {
  // TODO: Replace stub with actual API call
  // const response = await fetch(`${BP_BASE_URL}/sessions/${applicationId}/quotes`, {
  //   headers: {
  //     'Authorization': `Bearer ${BP_API_KEY}`,
  //   },
  // });

  console.info('[BoldPenguinClient] getQuotes called — integration pending');

  return {
    status: 'not_configured',
    message: 'Bold Penguin integration pending',
  };
}
