-- 001_initial_schema.sql
-- ShieldWave initial database schema

-- ═══════════════════════════════════════════════════════════════════════
-- Trigger function: auto-update updated_at on row modification
-- ═══════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════════
-- customers
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS customers (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name     varchar     NOT NULL,
  dba               varchar,
  address           varchar,
  city              varchar,
  state             varchar(2),
  zip               varchar(10),
  contact_first_name varchar,
  contact_last_name  varchar,
  email             varchar     NOT NULL UNIQUE,
  phone             varchar(20),
  naics_code        varchar(10),
  annual_revenue    numeric(12,2),
  employee_count    integer,
  estimated_payroll numeric(12,2),
  services          jsonb       DEFAULT '[]'::jsonb,
  chemicals_used    boolean     DEFAULT false,
  works_at_height   boolean     DEFAULT false,
  claims_history    jsonb       DEFAULT '[]'::jsonb,
  source            varchar     DEFAULT 'web',
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);

CREATE TRIGGER set_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════
-- quotes
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS quotes (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id       uuid        NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  carrier_name      varchar     NOT NULL,
  carrier_quote_id  varchar,
  line_of_business  varchar     NOT NULL CHECK (line_of_business IN ('GL','BOP','WC','AUTO','UMBRELLA','POLLUTION')),
  premium_annual    numeric(10,2),
  premium_monthly   numeric(10,2),
  deductible        numeric(10,2),
  coverage_limits   jsonb,
  status            varchar     DEFAULT 'pending' CHECK (status IN ('pending','quoted','declined','expired','bound')),
  quoted_at         timestamptz,
  expires_at        timestamptz,
  raw_response      jsonb,
  created_at        timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════════
-- policies
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS policies (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id        uuid        NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  quote_id           uuid        REFERENCES quotes(id) ON DELETE SET NULL,
  carrier_name       varchar     NOT NULL,
  carrier_policy_id  varchar,
  line_of_business   varchar     NOT NULL,
  premium            numeric(10,2),
  effective_date     date,
  expiry_date        date,
  status             varchar     DEFAULT 'active' CHECK (status IN ('active','cancelled','expired','renewed')),
  commission_rate    numeric(5,4),
  commission_amount  numeric(10,2),
  coi_url            text,
  bound_at           timestamptz,
  created_at         timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════════
-- commissions
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS commissions (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id         uuid        NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
  carrier_name      varchar     NOT NULL,
  period_start      date,
  period_end         date,
  premium_basis     numeric(10,2),
  commission_rate   numeric(5,4),
  commission_amount numeric(10,2),
  status            varchar     DEFAULT 'expected' CHECK (status IN ('expected','received','reconciled')),
  paid_at           timestamptz,
  created_at        timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════════
-- certificate_holders
-- ═══════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS certificate_holders (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id         uuid        NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
  holder_name       varchar     NOT NULL,
  holder_address    text,
  coi_url           text,
  generated_at      timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════════
-- Indexes
-- ═══════════════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_customers_email     ON customers(email);
CREATE INDEX IF NOT EXISTS idx_quotes_customer_id  ON quotes(customer_id);
CREATE INDEX IF NOT EXISTS idx_policies_customer_id ON policies(customer_id);
CREATE INDEX IF NOT EXISTS idx_policies_quote_id   ON policies(quote_id);
