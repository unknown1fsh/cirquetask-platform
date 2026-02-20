-- V3: Professional Features Migration
-- Sprint Management, Time Tracking, Dependencies, Workflow, Custom Fields, etc.

-- Sprints table
CREATE TABLE IF NOT EXISTS sprints (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    goal TEXT,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'PLANNING',
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    completed_points INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add sprint_id to tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS sprint_id BIGINT REFERENCES sprints(id) ON DELETE SET NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS estimated_hours DOUBLE PRECISION;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS logged_hours DOUBLE PRECISION DEFAULT 0;

-- Time logs table
CREATE TABLE IF NOT EXISTS time_logs (
    id BIGSERIAL PRIMARY KEY,
    task_id BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    duration_minutes INTEGER NOT NULL,
    description TEXT,
    logged_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Task dependencies table
CREATE TABLE IF NOT EXISTS task_dependencies (
    id BIGSERIAL PRIMARY KEY,
    source_task_id BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    target_task_id BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    dependency_type VARCHAR(50) NOT NULL,
    created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(source_task_id, target_task_id, dependency_type)
);

-- Workflow rules table
CREATE TABLE IF NOT EXISTS workflow_rules (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    trigger VARCHAR(50) NOT NULL,
    trigger_value VARCHAR(255),
    action VARCHAR(50) NOT NULL,
    action_value VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Custom field definitions table
CREATE TABLE IF NOT EXISTS custom_field_definitions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    field_type VARCHAR(50) NOT NULL,
    dropdown_options TEXT,
    is_required BOOLEAN DEFAULT false,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Custom field values table
CREATE TABLE IF NOT EXISTS custom_field_values (
    id BIGSERIAL PRIMARY KEY,
    task_id BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    definition_id BIGINT NOT NULL REFERENCES custom_field_definitions(id) ON DELETE CASCADE,
    field_value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(task_id, definition_id)
);

-- Task templates table
CREATE TABLE IF NOT EXISTS task_templates (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    default_title VARCHAR(500),
    default_description TEXT,
    priority VARCHAR(50) DEFAULT 'MEDIUM',
    type VARCHAR(50) DEFAULT 'TASK',
    story_points INTEGER,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recurring tasks table
CREATE TABLE IF NOT EXISTS recurring_tasks (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    priority VARCHAR(50) DEFAULT 'MEDIUM',
    type VARCHAR(50) DEFAULT 'TASK',
    story_points INTEGER,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    column_id BIGINT REFERENCES board_columns(id) ON DELETE SET NULL,
    recurrence_pattern VARCHAR(50) NOT NULL,
    next_occurrence DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Webhooks table
CREATE TABLE IF NOT EXISTS webhooks (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(1000) NOT NULL,
    events TEXT,
    secret_token VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API tokens table
CREATE TABLE IF NOT EXISTS api_tokens (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    token_prefix VARCHAR(20) NOT NULL,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scopes TEXT,
    expires_at TIMESTAMP,
    last_used_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    entity_type VARCHAR(100) NOT NULL,
    entity_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL,
    field_name VARCHAR(255),
    old_value TEXT,
    new_value TEXT,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sprints_project ON sprints(project_id);
CREATE INDEX IF NOT EXISTS idx_sprints_status ON sprints(status);
CREATE INDEX IF NOT EXISTS idx_tasks_sprint ON tasks(sprint_id);
CREATE INDEX IF NOT EXISTS idx_time_logs_task ON time_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_time_logs_user ON time_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_time_logs_date ON time_logs(logged_date);
CREATE INDEX IF NOT EXISTS idx_task_dependencies_source ON task_dependencies(source_task_id);
CREATE INDEX IF NOT EXISTS idx_task_dependencies_target ON task_dependencies(target_task_id);
CREATE INDEX IF NOT EXISTS idx_workflow_rules_project ON workflow_rules(project_id);
CREATE INDEX IF NOT EXISTS idx_custom_field_defs_project ON custom_field_definitions(project_id);
CREATE INDEX IF NOT EXISTS idx_custom_field_values_task ON custom_field_values(task_id);
CREATE INDEX IF NOT EXISTS idx_recurring_tasks_next ON recurring_tasks(next_occurrence);
CREATE INDEX IF NOT EXISTS idx_webhooks_project ON webhooks(project_id);
CREATE INDEX IF NOT EXISTS idx_api_tokens_user ON api_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_api_tokens_prefix ON api_tokens(token_prefix);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
