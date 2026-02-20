package com.cirquetask.service;

import java.util.Set;

public interface MentionService {

    Set<Long> extractMentionedUserIds(String content, Long projectId);

    void processMentions(String content, Long projectId, Long taskId, Long senderId);
}
