const API_BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) {
    if (data.details) {
      const msgs = Object.entries(data.details)
        .map(([field, errs]) => `${field}: ${Array.isArray(errs) ? errs.join(', ') : errs}`)
        .join('. ');
      throw new Error(msgs || data.error || `Request failed: ${res.status}`);
    }
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
  return data;
}

export function submitQuote(intake) {
  return request('/quotes', { method: 'POST', body: JSON.stringify(intake) });
}

export function bindPolicy(quoteId, customerId, paymentMethodId) {
  return request('/bind', {
    method: 'POST',
    body: JSON.stringify({ quoteId, customerId, paymentMethodId }),
  });
}

export function createSetupIntent(email, customerId) {
  return request('/payment/setup', {
    method: 'POST',
    body: JSON.stringify({ email, customerId }),
  });
}

export function addCertificateHolder(policyId, holderName, holderAddress) {
  return request('/coi', {
    method: 'POST',
    body: JSON.stringify({ policyId, holderName, holderAddress }),
  });
}
