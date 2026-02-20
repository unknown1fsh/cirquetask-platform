package com.cirquetask.service;

import com.cirquetask.model.dto.PlanDto;
import com.cirquetask.model.enums.Plan;

/**
 * Billing and subscription operations (Stripe checkout, portal, plan info).
 */
public interface BillingService {

    /**
     * Returns plan, limits and enabled features for the given user.
     */
    PlanDto getPlanInfo(Long userId);

    /**
     * Creates a Stripe Checkout Session for the given plan and interval.
     * @param userId current user
     * @param plan PRO or BUSINESS
     * @param yearly true for annual billing
     * @return URL to redirect the user to Stripe Checkout
     */
    String createCheckoutSession(Long userId, Plan plan, boolean yearly);

    /**
     * Creates a Stripe Customer Portal session URL for the user to manage subscription/card.
     */
    String createPortalSessionUrl(Long userId);

    /**
     * Handles Stripe webhook events (subscription updated/deleted, etc.).
     */
    void handleWebhook(String payload, String signature);
}
