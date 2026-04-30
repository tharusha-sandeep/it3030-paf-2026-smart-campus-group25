package com.smartcampus.notification.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record NotificationResponseDTO(
    UUID id,
    String message,
    String type,
    String referenceId,
    boolean read,
    LocalDateTime createdAt
) {}