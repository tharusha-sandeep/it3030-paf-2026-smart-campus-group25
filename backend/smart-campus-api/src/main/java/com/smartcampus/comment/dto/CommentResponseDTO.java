package com.smartcampus.comment.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record CommentResponseDTO(
    UUID id,
    UUID ticketId,
    UUID authorId,
    String authorName,
    String content,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}