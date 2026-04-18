package com.smartcampus.notification;

import com.smartcampus.notification.dto.NotificationResponseDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // GET /api/notifications  — get all my notifications
    @GetMapping
    public ResponseEntity<List<NotificationResponseDTO>> getMyNotifications(Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(notificationService.getMyNotifications(userId));
    }

    // GET /api/notifications/unread-count
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(userId)));
    }

    // PATCH /api/notifications/{id}/read
    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationResponseDTO> markAsRead(
            @PathVariable UUID id, Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(notificationService.markAsRead(id, userId));
    }

    // POST /api/notifications/read-all
    @PostMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        notificationService.markAllAsRead(userId);
        return ResponseEntity.noContent().build();
    }
}
