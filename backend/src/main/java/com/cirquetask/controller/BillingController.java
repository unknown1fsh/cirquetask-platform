package com.cirquetask.controller;

import com.cirquetask.model.dto.ApiResponse;
import com.cirquetask.model.dto.PlanDto;
import com.cirquetask.model.enums.Plan;
import com.cirquetask.security.SecurityUtils;
import com.cirquetask.service.BillingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/billing")
@RequiredArgsConstructor
@Tag(name = "Billing", description = "Subscription and plan endpoints")
public class BillingController {

    private final BillingService billingService;

    @GetMapping("/plan")
    @Operation(summary = "Get current user's plan, limits and features")
    public ResponseEntity<ApiResponse<PlanDto>> getPlan() {
        Long userId = SecurityUtils.getCurrentUserId();
        PlanDto plan = billingService.getPlanInfo(userId);
        return ResponseEntity.ok(ApiResponse.success(plan));
    }

    @PostMapping("/checkout-session")
    @Operation(summary = "Create Stripe Checkout session for subscription")
    public ResponseEntity<ApiResponse<Map<String, String>>> createCheckoutSession(
            @RequestBody Map<String, Object> body) {
        Long userId = SecurityUtils.getCurrentUserId();
        String planStr = (String) body.get("plan");
        Boolean yearly = body.containsKey("yearly") && Boolean.TRUE.equals(body.get("yearly"));
        Plan plan = planStr != null ? Plan.valueOf(planStr.toUpperCase()) : null;
        String url = billingService.createCheckoutSession(userId, plan, yearly);
        return ResponseEntity.ok(ApiResponse.success(Map.of("url", url)));
    }

    @GetMapping("/portal-session")
    @Operation(summary = "Get Stripe Customer Portal URL")
    public ResponseEntity<ApiResponse<Map<String, String>>> getPortalSession() {
        Long userId = SecurityUtils.getCurrentUserId();
        String url = billingService.createPortalSessionUrl(userId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("url", url)));
    }

    @PostMapping("/webhook")
    @Operation(summary = "Stripe webhook (called by Stripe, no auth)")
    public ResponseEntity<String> webhook(
            @RequestBody String payload,
            @RequestHeader(value = "Stripe-Signature", required = false) String signature) {
        billingService.handleWebhook(payload, signature != null ? signature : "");
        return ResponseEntity.ok().body("OK");
    }
}
