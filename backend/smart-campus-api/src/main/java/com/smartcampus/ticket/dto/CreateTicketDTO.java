package com.smartcampus.ticket.dto;

import com.smartcampus.ticket.TicketCategory;
import com.smartcampus.ticket.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateTicketDTO(
    @NotBlank String title,
    @NotBlank String description,
    @NotBlank String location,
    @NotNull TicketCategory category,
    @NotNull TicketPriority priority,
    String contactDetails,
    Long resourceId        // optional — links to a resource from the catalogue
) {}