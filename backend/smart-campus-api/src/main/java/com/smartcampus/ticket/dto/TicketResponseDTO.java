package com.smartcampus.ticket.dto;

import com.smartcampus.ticket.TicketCategory;
import com.smartcampus.ticket.TicketPriority;
import com.smartcampus.ticket.TicketStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record TicketResponseDTO(
    UUID id,
    UUID reporterId,
    String reporterName,
    UUID assigneeId,
    String assigneeName,
    String title,
    String description,
    String location,
    TicketCategory category,
    TicketPriority priority,
    TicketStatus status,
    String contactDetails,
    List<String> attachments,
    String resolutionNotes,
    String rejectionReason,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}