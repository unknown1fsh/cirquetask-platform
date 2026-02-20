package com.cirquetask.service.impl;

import com.cirquetask.model.entity.Task;
import com.cirquetask.model.entity.Webhook;
import com.cirquetask.repository.WebhookRepository;
import com.cirquetask.service.WebhookService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebhookServiceImpl implements WebhookService {

    private final WebhookRepository webhookRepository;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    @Async
    public void triggerWebhooks(Long projectId, String event, Object payload) {
        List<Webhook> webhooks = webhookRepository.findByProjectIdAndIsActiveTrue(projectId);

        for (Webhook webhook : webhooks) {
            if (isEventEnabled(webhook, event)) {
                try {
                    sendWebhook(webhook, event, payload);
                } catch (Exception e) {
                    log.error("Failed to send webhook {} for event {}: {}", webhook.getId(), event, e.getMessage());
                }
            }
        }
    }

    @Override
    @Async
    public void triggerTaskCreated(Task task) {
        Map<String, Object> payload = buildTaskPayload(task);
        triggerWebhooks(task.getProject().getId(), "task.created", payload);
    }

    @Override
    @Async
    public void triggerTaskUpdated(Task task) {
        Map<String, Object> payload = buildTaskPayload(task);
        triggerWebhooks(task.getProject().getId(), "task.updated", payload);
    }

    @Override
    @Async
    public void triggerTaskCompleted(Task task) {
        Map<String, Object> payload = buildTaskPayload(task);
        triggerWebhooks(task.getProject().getId(), "task.completed", payload);
    }

    private boolean isEventEnabled(Webhook webhook, String event) {
        if (webhook.getEvents() == null || webhook.getEvents().isBlank()) {
            return true;
        }
        return webhook.getEvents().contains(event) || webhook.getEvents().contains("*");
    }

    private void sendWebhook(Webhook webhook, String event, Object payload) throws Exception {
        String jsonPayload = objectMapper.writeValueAsString(payload);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Webhook-Event", event);

        if (webhook.getSecretToken() != null && !webhook.getSecretToken().isBlank()) {
            String signature = computeSignature(jsonPayload, webhook.getSecretToken());
            headers.set("X-Webhook-Signature", signature);
        }

        HttpEntity<String> entity = new HttpEntity<>(jsonPayload, headers);
        restTemplate.postForEntity(webhook.getUrl(), entity, String.class);

        log.info("Webhook sent to {} for event {}", webhook.getUrl(), event);
    }

    private String computeSignature(String payload, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec keySpec = new SecretKeySpec(secret.getBytes(), "HmacSHA256");
        mac.init(keySpec);
        byte[] hash = mac.doFinal(payload.getBytes());
        return "sha256=" + Base64.getEncoder().encodeToString(hash);
    }

    private Map<String, Object> buildTaskPayload(Task task) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("taskId", task.getId());
        payload.put("taskKey", task.getTaskKey());
        payload.put("title", task.getTitle());
        payload.put("status", task.getStatus().name());
        payload.put("priority", task.getPriority().name());
        payload.put("projectId", task.getProject().getId());
        return payload;
    }
}
