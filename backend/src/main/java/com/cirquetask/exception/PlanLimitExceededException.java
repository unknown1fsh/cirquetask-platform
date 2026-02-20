package com.cirquetask.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when an action is blocked by subscription plan limits (e.g. project count, member count)
 * or when a feature is not available on the current plan.
 */
@ResponseStatus(HttpStatus.PAYMENT_REQUIRED)
public class PlanLimitExceededException extends RuntimeException {

    public PlanLimitExceededException(String message) {
        super(message);
    }
}
