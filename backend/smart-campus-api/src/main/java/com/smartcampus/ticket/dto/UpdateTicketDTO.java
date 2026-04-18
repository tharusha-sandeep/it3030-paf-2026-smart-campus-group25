package com.smartcampus.ticket.dto;

import com.smartcampus.ticket.TicketStatus;
import java.util.UUID;

public record UpdateTicketDTO(
    TicketStatus status,
    String resolutionNotes,
    String rejectionReason,
    UUID assigneeId
) {}