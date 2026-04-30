package com.smartcampus.booking;

import java.time.LocalDate;
import java.util.List;
import com.smartcampus.notification.NotificationService;

public interface BookingService {

    BookingResponseDTO createBooking(BookingRequestDTO dto, String userId);

    List<BookingResponseDTO> getUserBookings(String userId);

    List<BookingResponseDTO> getAllBookings(BookingStatus status, LocalDate bookingDate, Long resourceId);

    BookingResponseDTO approveBooking(Long bookingId);

    BookingResponseDTO rejectBooking(Long bookingId, String rejectionReason);

    BookingResponseDTO cancelBooking(Long bookingId, String userId);

    BookingResponseDTO updateBooking(Long bookingId, BookingRequestDTO dto, String userId);

    void deleteBooking(Long bookingId, String userId);
}
