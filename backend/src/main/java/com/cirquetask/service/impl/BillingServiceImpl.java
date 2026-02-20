package com.cirquetask.service.impl;

import com.cirquetask.exception.BadRequestException;
import com.cirquetask.exception.ResourceNotFoundException;
import com.cirquetask.model.dto.PlanDto;
import com.cirquetask.model.entity.User;
import com.cirquetask.model.enums.Feature;
import com.cirquetask.model.enums.Plan;
import com.cirquetask.repository.ProjectMemberRepository;
import com.cirquetask.repository.ProjectRepository;
import com.cirquetask.repository.UserRepository;
import com.cirquetask.service.BillingService;
import com.cirquetask.service.PlanLimitService;
import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.Event;
import com.stripe.model.Subscription;
import com.stripe.model.checkout.Session;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import com.stripe.param.checkout.SessionCreateParams.LineItem;
import com.stripe.param.checkout.SessionCreateParams.Mode;
import com.stripe.net.Webhook;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class BillingServiceImpl implements BillingService {

    private static final String SUBSCRIPTION_ACTIVE = "active";
    private static final String SUBSCRIPTION_TRIALING = "trialing";
    private static final String METADATA_USER_ID = "userId";

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final PlanLimitService planLimitService;

    @Value("${stripe.api-key}")
    private String stripeApiKey;

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    @Value("${stripe.price-id-pro-monthly:}")
    private String priceIdProMonthly;

    @Value("${stripe.price-id-pro-yearly:}")
    private String priceIdProYearly;

    @Value("${stripe.price-id-business-monthly:}")
    private String priceIdBusinessMonthly;

    @Value("${stripe.price-id-business-yearly:}")
    private String priceIdBusinessYearly;

    @Value("${stripe.portal-return-url:http://localhost:4200/settings}")
    private String portalReturnUrl;

    @Value("${app.frontend-url:http://localhost:4200}")
    private String frontendUrl;

    public BillingServiceImpl(UserRepository userRepository,
                              ProjectRepository projectRepository,
                              ProjectMemberRepository projectMemberRepository,
                              PlanLimitService planLimitService) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.planLimitService = planLimitService;
    }

    @PostConstruct
    public void init() {
        if (stripeApiKey != null && !stripeApiKey.isBlank()) {
            Stripe.apiKey = stripeApiKey;
        }
    }

    @Override
    public PlanDto getPlanInfo(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        Plan effective = planLimitService.getEffectivePlan(user);
        int maxProjects = planLimitService.getMaxProjects(user);
        int maxMembersPerProject = effective == Plan.FREE ? 5 : (effective == Plan.PRO ? 15 : Integer.MAX_VALUE);
        long currentProjectCount = projectRepository.countByOwnerIdAndIsArchivedFalse(userId);
        List<Feature> enabled = Arrays.stream(Feature.values())
                .filter(f -> planLimitService.hasFeature(user, f))
                .collect(Collectors.toList());

        return PlanDto.builder()
                .plan(effective)
                .subscriptionStatus(user.getSubscriptionStatus())
                .currentPeriodEnd(user.getCurrentPeriodEnd())
                .maxProjects(maxProjects == Integer.MAX_VALUE ? -1 : maxProjects)
                .maxMembersPerProject(maxMembersPerProject == Integer.MAX_VALUE ? -1 : maxMembersPerProject)
                .currentProjectCount(currentProjectCount)
                .currentMembersInProject(0)
                .enabledFeatures(enabled)
                .build();
    }

    @Override
    public String createCheckoutSession(Long userId, Plan plan, boolean yearly) {
        if (plan == null || plan == Plan.FREE) {
            throw new BadRequestException("Invalid plan for checkout");
        }
        if (stripeApiKey == null || stripeApiKey.isBlank()) {
            throw new BadRequestException("Billing is not configured");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        String priceId = getPriceId(plan, yearly);
        if (priceId == null || priceId.isBlank()) {
            throw new BadRequestException("Price not configured for this plan");
        }

        try {
            String customerId = user.getStripeCustomerId();
            if (customerId == null || customerId.isBlank()) {
                Customer customer = Customer.create(CustomerCreateParams.builder()
                        .setEmail(user.getEmail())
                        .putMetadata(METADATA_USER_ID, String.valueOf(userId))
                        .build());
                customerId = customer.getId();
                user.setStripeCustomerId(customerId);
                userRepository.save(user);
            }

            SessionCreateParams.Builder params = SessionCreateParams.builder()
                    .setMode(Mode.SUBSCRIPTION)
                    .setCustomer(customerId)
                    .setSuccessUrl(frontendUrl + "/settings?checkout=success")
                    .setCancelUrl(frontendUrl + "/pricing?checkout=cancel")
                    .putMetadata(METADATA_USER_ID, String.valueOf(userId))
                    .addLineItem(LineItem.builder()
                            .setPrice(priceId)
                            .setQuantity(1L)
                            .build());

            Session session = Session.create(params.build());
            return session.getUrl();
        } catch (StripeException e) {
            log.error("Stripe checkout session failed for user {}: {}", userId, e.getMessage());
            throw new BadRequestException("Could not create checkout session: " + e.getMessage());
        }
    }

    @Override
    public String createPortalSessionUrl(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        if (user.getStripeCustomerId() == null || user.getStripeCustomerId().isBlank()) {
            throw new BadRequestException("No billing account found. Subscribe to a plan first.");
        }
        if (stripeApiKey == null || stripeApiKey.isBlank()) {
            throw new BadRequestException("Billing is not configured");
        }

        try {
            com.stripe.param.billingportal.SessionCreateParams params =
                    com.stripe.param.billingportal.SessionCreateParams.builder()
                            .setCustomer(user.getStripeCustomerId())
                            .setReturnUrl(portalReturnUrl)
                            .build();
            com.stripe.model.billingportal.Session portalSession =
                    com.stripe.model.billingportal.Session.create(params);
            return portalSession.getUrl();
        } catch (StripeException e) {
            log.error("Stripe portal session failed for user {}: {}", userId, e.getMessage());
            throw new BadRequestException("Could not open billing portal: " + e.getMessage());
        }
    }

    @Override
    public void handleWebhook(String payload, String signature) {
        if (webhookSecret == null || webhookSecret.isBlank()) {
            log.warn("Stripe webhook secret not set, skipping verification");
            return;
        }
        Event event;
        try {
            event = Webhook.constructEvent(payload, signature, webhookSecret);
        } catch (SignatureVerificationException e) {
            log.warn("Invalid Stripe webhook signature");
            throw new BadRequestException("Invalid webhook signature");
        }

        String type = event.getType();
        log.debug("Stripe webhook event: {}", type);

        switch (type) {
            case "customer.subscription.updated":
            case "customer.subscription.deleted":
                handleSubscriptionEvent(event);
                break;
            case "invoice.paid":
                handleInvoicePaid(event);
                break;
            default:
                log.debug("Unhandled webhook event type: {}", type);
        }
    }

    private void handleSubscriptionEvent(Event event) {
        Subscription subscription = (Subscription) event.getDataObjectDeserializer().getObject().orElse(null);
        if (subscription == null) return;

        String userIdStr = subscription.getMetadata() != null ? subscription.getMetadata().get(METADATA_USER_ID) : null;
        if (userIdStr == null && subscription.getCustomer() != null) {
            try {
                Customer c = Customer.retrieve(subscription.getCustomer());
                userIdStr = c.getMetadata() != null ? c.getMetadata().get(METADATA_USER_ID) : null;
            } catch (StripeException e) {
                log.warn("Could not retrieve customer for webhook: {}", e.getMessage());
            }
        }
        if (userIdStr == null) {
            log.warn("Webhook subscription event without userId in metadata");
            return;
        }

        Long userId = Long.parseLong(userIdStr);
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            log.warn("Webhook: user {} not found", userId);
            return;
        }

        if ("customer.subscription.deleted".equals(event.getType())) {
            user.setPlan(Plan.FREE);
            user.setSubscriptionId(null);
            user.setSubscriptionStatus("canceled");
            user.setCurrentPeriodEnd(null);
            userRepository.save(user);
            log.info("Subscription canceled for user {}", userId);
            return;
        }

        String status = subscription.getStatus();
        user.setSubscriptionId(subscription.getId());
        user.setSubscriptionStatus(status);

        if (subscription.getCurrentPeriodEnd() != null) {
            user.setCurrentPeriodEnd(LocalDateTime.ofInstant(
                    Instant.ofEpochSecond(subscription.getCurrentPeriodEnd()),
                    ZoneOffset.UTC));
        }

        Plan plan = planFromSubscription(subscription);
        if (plan != null) {
            user.setPlan(plan);
        }

        userRepository.save(user);
        log.info("Subscription updated for user {}: status={}, plan={}", userId, status, user.getPlan());
    }

    private void handleInvoicePaid(Event event) {
        com.stripe.model.Invoice invoice = (com.stripe.model.Invoice) event.getDataObjectDeserializer().getObject().orElse(null);
        if (invoice == null || invoice.getSubscription() == null) return;
        String subId = invoice.getSubscription();
        User user = userRepository.findBySubscriptionId(subId).orElse(null);
        if (user != null && user.getCurrentPeriodEnd() == null) {
            try {
                Subscription sub = Subscription.retrieve(subId);
                if (sub.getCurrentPeriodEnd() != null) {
                    user.setCurrentPeriodEnd(LocalDateTime.ofInstant(
                            Instant.ofEpochSecond(sub.getCurrentPeriodEnd()),
                            ZoneOffset.UTC));
                    userRepository.save(user);
                }
            } catch (StripeException e) {
                log.warn("Could not retrieve subscription {}: {}", subId, e.getMessage());
            }
        }
    }

    private Plan planFromSubscription(Subscription subscription) {
        if (subscription.getItems() == null || subscription.getItems().getData() == null || subscription.getItems().getData().isEmpty()) {
            return null;
        }
        String priceId = subscription.getItems().getData().get(0).getPrice().getId();
        if (priceId == null) return null;
        if (priceId.equals(priceIdProMonthly) || priceId.equals(priceIdProYearly)) return Plan.PRO;
        if (priceId.equals(priceIdBusinessMonthly) || priceId.equals(priceIdBusinessYearly)) return Plan.BUSINESS;
        return null;
    }

    private String getPriceId(Plan plan, boolean yearly) {
        return switch (plan) {
            case PRO -> yearly ? priceIdProYearly : priceIdProMonthly;
            case BUSINESS -> yearly ? priceIdBusinessYearly : priceIdBusinessMonthly;
            default -> null;
        };
    }
}
