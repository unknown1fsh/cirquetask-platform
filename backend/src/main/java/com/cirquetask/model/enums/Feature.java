package com.cirquetask.model.enums;

/**
 * Feature flags per plan. Used to gate premium features.
 */
public enum Feature {
    /** Gantt chart / timeline view */
    GANTT,
    /** Report generation (CSV, etc.) */
    REPORTS,
    /** Custom field definitions and values */
    CUSTOM_FIELDS,
    /** Time logging on tasks */
    TIME_LOG,
    /** API access (tokens, webhooks) */
    API_ACCESS
}
