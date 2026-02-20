package com.cirquetask.service;

import com.cirquetask.model.entity.Task;

public interface WebhookService {

    void triggerWebhooks(Long projectId, String event, Object payload);

    void triggerTaskCreated(Task task);

    void triggerTaskUpdated(Task task);

    void triggerTaskCompleted(Task task);
}
