import { config } from '../config/env.js';

const BASE_URL = config.coterie.baseUrl;
const SECRET_KEY = config.coterie.secretKey;
const PRODUCER_CODE = config.coterie.producerCode;

/**
 * Makes an authenticated request to the Coterie API.
 *
 * @param {string} path - API endpoint path (e.g. '/accounts')
 * @param {Object} options - fetch options override
 * @returns {Promise<Object>} parsed JSON response
 */
async function coterieRequest(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${SECRET_KEY}`,
    ...options.headers,
  };

  const startMs = Date.now();
  let response;

  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err) {
    const elapsed = Date.now() - startMs;
    console.error(
      `[CoterieClient] Network error: ${options.method || 'GET'} ${path} (${elapsed}ms)`,
      err.message,
    );
    throw new CoterieApiError(
      `Network error contacting Coterie API: ${err.message}`,
      0,
      null,
    );
  }

  const elapsed = Date.now() - startMs;
  const body = await response.text();
  let data;

  try {
    data = body ? JSON.parse(body) : null;
  } catch {
    console.error(
      `[CoterieClient] Invalid JSON from ${path}: ${body.slice(0, 200)}`,
    );
    throw new CoterieApiError(
      'Invalid JSON response from Coterie API',
      response.status,
      body,
    );
  }

  if (!response.ok) {
    console.error(
      `[CoterieClient] ${response.status} ${options.method || 'GET'} ${path} (${elapsed}ms)`,
      data,
    );
    throw new CoterieApiError(
      data?.message || data?.error || `Coterie API returned ${response.status}`,
      response.status,
      data,
    );
  }

  console.info(
    `[CoterieClient] ${response.status} ${options.method || 'GET'} ${path} (${elapsed}ms)`,
  );

  return data;
}

/**
 * Custom error class for Coterie API failures.
 */
export class CoterieApiError extends Error {
  /**
   * @param {string} message
   * @param {number} statusCode
   * @param {*} responseBody
   */
  constructor(message, statusCode, responseBody) {
    super(message);
    this.name = 'CoterieApiError';
    this.statusCode = statusCode;
    this.responseBody = responseBody;
  }
}

/**
 * Creates an application/account in Coterie's system.
 *
 * @param {Object} carrierFields - Mapped carrier fields from fieldMapper
 * @returns {Promise<Object>} The created application record
 */
export async function createApplication(carrierFields) {
  const body = {
    businessName: carrierFields.businessName,
    mailingAddress: {
      street: carrierFields.mailingAddress.street,
      city: carrierFields.mailingAddress.city,
      state: carrierFields.mailingAddress.state,
      zip: carrierFields.mailingAddress.zip,
    },
    contactFirstName: carrierFields.contactFirstName,
    contactLastName: carrierFields.contactLastName,
    contactEmail: carrierFields.contactEmail,
    industry: carrierFields.naicsCode,
    annualRevenue: carrierFields.annualRevenue,
    numberOfEmployees: carrierFields.numberOfEmployees,
    yearsInBusiness: carrierFields.yearsInBusiness ?? 3,
    producerCode: PRODUCER_CODE,
  };

  console.info('[CoterieClient] Creating application for:', carrierFields.businessName);

  return coterieRequest('/accounts', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * Computes the next-day effective date in ISO format (YYYY-MM-DD).
 */
function getEffectiveDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

/**
 * Requests a General Liability quote for an existing application.
 *
 * @param {string} applicationId - Coterie application/account ID
 * @returns {Promise<Object>} The GL quote response
 */
export async function getGLQuote(applicationId) {
  const body = {
    applicationId,
    policyType: 'GL',
    effectiveDate: getEffectiveDate(),
    limits: {
      perOccurrence: 1_000_000,
      aggregate: 2_000_000,
    },
    deductible: 500,
  };

  console.info('[CoterieClient] Requesting GL quote for application:', applicationId);

  return coterieRequest('/quotes', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * Requests a Business Owner's Policy quote for an existing application.
 *
 * @param {string} applicationId - Coterie application/account ID
 * @returns {Promise<Object>} The BOP quote response
 */
export async function getBOPQuote(applicationId) {
  const body = {
    applicationId,
    policyType: 'BOP',
    effectiveDate: getEffectiveDate(),
    limits: {
      perOccurrence: 1_000_000,
      aggregate: 2_000_000,
    },
    deductible: 500,
  };

  console.info('[CoterieClient] Requesting BOP quote for application:', applicationId);

  return coterieRequest('/quotes', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * Binds (purchases) a quote, turning it into a live policy.
 *
 * @param {string} quoteId - The quote ID to bind
 * @param {Object} paymentInfo - Payment method details
 * @param {string} paymentInfo.paymentMethodToken - Tokenized payment method
 * @returns {Promise<Object>} The bound policy record
 */
export async function bindPolicy(quoteId, paymentInfo) {
  const body = {
    quoteId,
    paymentMethodToken: paymentInfo.paymentMethodToken,
  };

  console.info('[CoterieClient] Binding quote:', quoteId);

  return coterieRequest('/policies', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * Retrieves the Certificate of Insurance PDF URL for a bound policy.
 *
 * @param {string} policyId - The policy ID
 * @returns {Promise<Object>} Object containing the COI PDF URL
 */
export async function getCOI(policyId) {
  console.info('[CoterieClient] Fetching COI for policy:', policyId);

  return coterieRequest(`/policies/${encodeURIComponent(policyId)}/coi`);
}
