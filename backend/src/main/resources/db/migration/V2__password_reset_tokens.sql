-- Password reset tokens for "forgot password" flow
CREATE TABLE password_reset_tokens (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_prt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_prt_token ON password_reset_tokens(token);
CREATE INDEX idx_prt_user ON password_reset_tokens(user_id);
CREATE INDEX idx_prt_expires ON password_reset_tokens(expires_at);
