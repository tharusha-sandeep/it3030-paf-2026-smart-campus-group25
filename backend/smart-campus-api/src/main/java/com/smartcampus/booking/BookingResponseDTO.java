package com.smartcampus.booking;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
public class BookingResponseDTO {
    private Long id;
    private Long resourceId;
    private String resourceName;
    private String resourceLocation;
    private UUID userId;
    private String userName;
    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String purpose;
    private int attendees;
    private BookingStatus status;
    private String rejectionReason;
    private LocalDateTime createdAt;
}
