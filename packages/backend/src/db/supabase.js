import { createClient } from '@supabase/supabase-js';
import { config } from '../config/env.js';

export const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
);

// ─── Customer helpers ────────────────────────────────────────────────

export async function getCustomerByEmail(email) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('email', email)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data;
}

export async function createCustomer(customer) {
  const { data, error } = await supabase
    .from('customers')
    .insert(customer)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCustomer(id, updates) {
  const { data, error } = await supabase
    .from('customers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── Quote helpers ───────────────────────────────────────────────────

export async function createQuote(quote) {
  const { data, error } = await supabase
    .from('quotes')
    .insert(quote)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getQuotesByCustomer(customerId) {
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateQuoteStatus(id, status) {
  const { data, error } = await supabase
    .from('quotes')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── Policy helpers ──────────────────────────────────────────────────

export async function createPolicy(policy) {
  const { data, error } = await supabase
    .from('policies')
    .insert(policy)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getPoliciesByCustomer(customerId) {
  const { data, error } = await supabase
    .from('policies')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function updatePolicyStatus(id, status) {
  const { data, error } = await supabase
    .from('policies')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── Commission helpers ──────────────────────────────────────────────

export async function createCommission(commission) {
  const { data, error } = await supabase
    .from('commissions')
    .insert(commission)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── Certificate holder helpers ──────────────────────────────────────

export async function createCertificateHolder(holder) {
  const { data, error } = await supabase
    .from('certificate_holders')
    .insert(holder)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getCertificateHoldersByPolicy(policyId) {
  const { data, error } = await supabase
    .from('certificate_holders')
    .select('*')
    .eq('policy_id', policyId)
    .order('generated_at', { ascending: false });

  if (error) throw error;
  return data;
}
