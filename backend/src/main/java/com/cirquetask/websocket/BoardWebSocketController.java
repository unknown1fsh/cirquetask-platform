package com.cirquetask.websocket;

import com.cirquetask.model.dto.TaskDto;
import com.cirquetask.model.dto.TaskMoveRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
@RequiredArgsConstructor
@Slf4j
public class BoardWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/board/{boardId}/task-moved")
    public void handleTaskMoved(@DestinationVariable Long boardId, @Payload Map<String, Object> payload) {
        log.debug("Task moved on board {}: {}", boardId, payload);
        messagingTemplate.convertAndSend("/topic/board/" + boardId, Map.of(
                "type", "TASK_MOVED",
                "data", payload
        ));
    }

    @MessageMapping("/board/{boardId}/task-created")
    public void handleTaskCreated(@DestinationVariable Long boardId, @Payload TaskDto taskDto) {
        log.debug("Task created on board {}: {}", boardId, taskDto.getTaskKey());
        messagingTemplate.convertAndSend("/topic/board/" + boardId, Map.of(
                "type", "TASK_CREATED",
                "data", taskDto
        ));
    }

    @MessageMapping("/board/{boardId}/task-updated")
    public void handleTaskUpdated(@DestinationVariable Long boardId, @Payload TaskDto taskDto) {
        log.debug("Task updated on board {}: {}", boardId, taskDto.getTaskKey());
        messagingTemplate.convertAndSend("/topic/board/" + boardId, Map.of(
                "type", "TASK_UPDATED",
                "data", taskDto
        ));
    }

    @MessageMapping("/board/{boardId}/task-deleted")
    public void handleTaskDeleted(@DestinationVariable Long boardId, @Payload Map<String, Long> payload) {
        log.debug("Task deleted on board {}: {}", boardId, payload);
        messagingTemplate.convertAndSend("/topic/board/" + boardId, Map.of(
                "type", "TASK_DELETED",
                "data", payload
        ));
    }

    public void broadcastBoardUpdate(Long boardId, String type, Object data) {
        messagingTemplate.convertAndSend("/topic/board/" + boardId, Map.of(
                "type", type,
                "data", data
        ));
    }
}
