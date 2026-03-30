import * as coterieClient from './coterieClient.js';
import * as boldPenguinClient from './boldPenguinClient.js';
import * as pieInsuranceClient from './pieInsuranceClient.js';

/**
 * Routes a carrier-mapped application through the tiered quoting system.
 *
 * Tier 1: Coterie (instant API quotes)
 * Tier 2: Bold Penguin (multi-carrier marketplace)
 * Tier 3: Manual / wholesale review
 *
 * @param {Object} carrierFields - Output from mapIntakeToCarrierFields
 * @returns {Promise<{quotes: Array, recommendations: Array, requiresManualReview: boolean, manualReviewReason: string|null}>}
 */
export async function routeToCarriers(carrierFields) {
  const quotes = [];
  const recommendations = [];
  let requiresManualReview = false;
  let manualReviewReason = null;

  const claimsCount = carrierFields.priorClaimsCount ?? 0;
  const isMidMarket = carrierFields.annualRevenue > 1_000_000;
  const highClaims = claimsCount > 2;

  // ── Pre-screening flags ──────────────────────────────────────────────
  if (isMidMarket) {
    console.info('[CarrierRouter] Mid-market flag: revenue exceeds $1M');
  }

  let skipTier1And2 = false;

  if (highClaims) {
    console.info('[CarrierRouter] High claims count — skipping Tier 1 & 2');
    skipTier1And2 = true;
  }

  // Height risk filter: worksAtHeight with stories > 3
  if (carrierFields.worksAtHeight && (carrierFields.stories ?? 0) > 3) {
    console.info('[CarrierRouter] High-rise risk — limiting carrier pool');
    // Most instant-quote carriers decline 3+ story work
    skipTier1And2 = true;
  }

  // ── Tier 1: Coterie (instant API) ────────────────────────────────────
  if (!skipTier1And2) {
    try {
      const application = await coterieClient.createApplication(carrierFields);
      const applicationId = application.id ?? application.applicationId;

      if (!applicationId) {
        console.warn('[CarrierRouter] Coterie application created but no ID returned');
      } else {
        // Fire GL and BOP quotes in parallel
        const [glResult, bopResult] = await Promise.allSettled([
          coterieClient.getGLQuote(applicationId),
          coterieClient.getBOPQuote(applicationId),
        ]);

        if (glResult.status === 'fulfilled' && glResult.value) {
          quotes.push({
            carrier: 'Coterie',
            policyType: 'GL',
            tier: 1,
            quoteId: glResult.value.id ?? glResult.value.quoteId,
            premium: glResult.value.premium ?? null,
            limits: glResult.value.limits ?? null,
            effectiveDate: glResult.value.effectiveDate ?? null,
            raw: glResult.value,
          });
        } else if (glResult.status === 'rejected') {
          console.warn('[CarrierRouter] Coterie GL quote failed:', glResult.reason?.message);
        }

        if (bopResult.status === 'fulfilled' && bopResult.value) {
          quotes.push({
            carrier: 'Coterie',
            policyType: 'BOP',
            tier: 1,
            quoteId: bopResult.value.id ?? bopResult.value.quoteId,
            premium: bopResult.value.premium ?? null,
            limits: bopResult.value.limits ?? null,
            effectiveDate: bopResult.value.effectiveDate ?? null,
            raw: bopResult.value,
          });
        } else if (bopResult.status === 'rejected') {
          console.warn('[CarrierRouter] Coterie BOP quote failed:', bopResult.reason?.message);
        }
      }
    } catch (err) {
      console.error('[CarrierRouter] Coterie Tier 1 error:', err.message);
    }
  }

  // ── Tier 2: Bold Penguin (multi-carrier) ─────────────────────────────
  if (!skipTier1And2 && quotes.length === 0) {
    console.info('[CarrierRouter] No Tier 1 quotes — falling through to Tier 2 (Bold Penguin)');
    try {
      const bpResult = await boldPenguinClient.submitApplication(carrierFields);

      if (bpResult.status === 'not_configured') {
        console.info('[CarrierRouter] Bold Penguin not yet configured, skipping');
      } else if (bpResult.applicationId) {
        const bpQuotes = await boldPenguinClient.getQuotes(bpResult.applicationId);
        if (Array.isArray(bpQuotes.quotes)) {
          for (const q of bpQuotes.quotes) {
            quotes.push({
              carrier: q.carrier ?? 'Bold Penguin',
              policyType: q.policyType ?? 'GL',
              tier: 2,
              quoteId: q.id ?? q.quoteId,
              premium: q.premium ?? null,
              limits: q.limits ?? null,
              effectiveDate: q.effectiveDate ?? null,
              raw: q,
            });
          }
        }
      }
    } catch (err) {
      console.error('[CarrierRouter] Bold Penguin Tier 2 error:', err.message);
    }
  }

  // ── Tier 3: Manual / wholesale review ────────────────────────────────
  if (quotes.length === 0) {
    requiresManualReview = true;

    if (highClaims) {
      manualReviewReason =
        'Your risk profile needs specialty review — we\'ll have options in 24\u201348 hours.';
    } else if (carrierFields.worksAtHeight && (carrierFields.stories ?? 0) > 3) {
      manualReviewReason =
        'High-rise exterior cleaning requires specialty carriers — we\'ll have options in 24\u201348 hours.';
    } else {
      manualReviewReason =
        'Your risk profile needs specialty review — we\'ll have options in 24\u201348 hours.';
    }

    console.info('[CarrierRouter] No quotes from Tier 1/2 — flagged for manual review');
  }

  // ── Coverage recommendations ─────────────────────────────────────────

  // Pollution liability for chemical usage
  if (carrierFields.chemicalsUsed) {
    recommendations.push({
      coverageType: 'Pollution Liability',
      reason:
        'You indicated chemical usage (e.g., sodium hypochlorite, surfactants). ' +
        'Pollution liability covers third-party bodily injury or property damage from chemical discharge.',
      priority: 'high',
    });
  }

  // Workers compensation if more than solo operator
  if (carrierFields.numberOfEmployees > 1) {
    let wcQuoteAttempt = null;
    try {
      const wcResult = await pieInsuranceClient.getWCQuote(carrierFields);
      if (wcResult.status !== 'not_configured') {
        wcQuoteAttempt = wcResult;
      }
    } catch (err) {
      console.warn('[CarrierRouter] Pie WC quote attempt failed:', err.message);
    }

    recommendations.push({
      coverageType: 'Workers Compensation',
      reason:
        `With ${carrierFields.numberOfEmployees} employees, workers\u2019 compensation ` +
        'is required in most states and protects against workplace injury claims.',
      priority: 'required',
      wcClassCode: carrierFields.wcClassCode,
      quote: wcQuoteAttempt,
    });
  }

  // Commercial auto
  if (carrierFields.hasBusinessVehicles) {
    recommendations.push({
      coverageType: 'Commercial Auto',
      reason:
        'Your revenue level indicates business vehicle usage. Commercial auto covers ' +
        'liability and physical damage for vehicles used in business operations.',
      priority: 'recommended',
    });
  }

  return {
    quotes,
    recommendations,
    requiresManualReview,
    manualReviewReason,
  };
}
