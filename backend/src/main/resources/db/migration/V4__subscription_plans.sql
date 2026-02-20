-- Subscription / billing fields on users (plan, Stripe subscription)
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS plan VARCHAR(20) NOT NULL DEFAULT 'FREE',
    ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS subscription_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50),
    ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP NULL;

CREATE INDEX IF NOT EXISTS idx_users_plan ON users(plan);
CREATE INDEX IF NOT EXISTS idx_users_subscription_id ON users(subscription_id);
