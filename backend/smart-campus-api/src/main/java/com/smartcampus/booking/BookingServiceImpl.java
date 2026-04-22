package com.smartcampus.booking;

import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.resource.Resource;
import com.smartcampus.resource.ResourceRepository;
import com.smartcampus.user.AppUser;
import com.smartcampus.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;

    public BookingServiceImpl(BookingRepository bookingRepository,
                              ResourceRepository resourceRepository,
                              UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.resourceRepository = resourceRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public BookingResponseDTO createBooking(BookingRequestDTO dto, String userId) {
        // Validate times
        if (!dto.getEndTime().isAfter(dto.getStartTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End time must be after start time");
        }

        Resource resource = resourceRepository.findById(dto.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + dto.getResourceId()));

        AppUser user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Check for overlapping bookings (exclude id = -1 means no exclusion)
        List<Booking> conflicts = bookingRepository.findOverlappingBookings(
                dto.getResourceId(),
                dto.getBookingDate(),
                dto.getStartTime(),
                dto.getEndTime(),
                -1L
        );
        if (!conflicts.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Resource is already booked for the selected time slot");
        }

        Booking booking = Booking.builder()
                .resource(resource)
                .user(user)
                .bookingDate(dto.getBookingDate())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .purpose(dto.getPurpose())
                .attendees(dto.getAttendees())
                .status(BookingStatus.PENDING)
                .build();

        return mapToDTO(bookingRepository.save(booking));
    }

    @Override
    public List<BookingResponseDTO> getUserBookings(String userId) {
        return bookingRepository.findByUserId(UUID.fromString(userId)).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingResponseDTO> getAllBookings(BookingStatus status, LocalDate bookingDate, Long resourceId) {
        return bookingRepository.findAllWithFilters(status, bookingDate, resourceId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BookingResponseDTO approveBooking(Long bookingId) {
        Booking booking = getBookingOrThrow(bookingId);
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only PENDING bookings can be approved");
        }
        booking.setStatus(BookingStatus.APPROVED);
        return mapToDTO(bookingRepository.save(booking));
    }

    @Override
    @Transactional
    public BookingResponseDTO rejectBooking(Long bookingId, String rejectionReason) {
        Booking booking = getBookingOrThrow(bookingId);
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only PENDING bookings can be rejected");
        }
        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(rejectionReason);
        return mapToDTO(bookingRepository.save(booking));
    }

    @Override
    @Transactional
    public BookingResponseDTO cancelBooking(Long bookingId, String userId) {
        Booking booking = getBookingOrThrow(bookingId);

        // Ensure the booking belongs to the requesting user
        if (!booking.getUser().getId().toString().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You are not allowed to cancel this booking");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Booking is already cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return mapToDTO(bookingRepository.save(booking));
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public BookingResponseDTO updateBooking(Long bookingId, BookingRequestDTO dto, String userId) {
        Booking booking = getBookingOrThrow(bookingId);

        // Ownership check
        if (!booking.getUser().getId().toString().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You are not allowed to edit this booking");
        }

        // Only PENDING bookings can be edited
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only PENDING bookings can be edited");
        }

        if (!dto.getEndTime().isAfter(dto.getStartTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "End time must be after start time");
        }

        // Conflict check (exclude current booking)
        List<Booking> conflicts = bookingRepository.findOverlappingBookings(
                booking.getResource().getId(),
                dto.getBookingDate(),
                dto.getStartTime(),
                dto.getEndTime(),
                bookingId
        );
        if (!conflicts.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Resource is already booked for the selected time slot");
        }

        booking.setBookingDate(dto.getBookingDate());
        booking.setStartTime(dto.getStartTime());
        booking.setEndTime(dto.getEndTime());
        booking.setPurpose(dto.getPurpose());
        booking.setAttendees(dto.getAttendees());

        return mapToDTO(bookingRepository.save(booking));
    }

    @Override
    @Transactional
    public void deleteBooking(Long bookingId, String userId) {
        Booking booking = getBookingOrThrow(bookingId);

        // Ownership check
        if (!booking.getUser().getId().toString().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You are not allowed to delete this booking");
        }

        // Only PENDING or CANCELLED bookings can be deleted
        if (booking.getStatus() == BookingStatus.APPROVED || booking.getStatus() == BookingStatus.REJECTED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only PENDING or CANCELLED bookings can be deleted");
        }

        bookingRepository.deleteById(bookingId);
    }

    private Booking getBookingOrThrow(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
    }

    private BookingResponseDTO mapToDTO(Booking booking) {
        return BookingResponseDTO.builder()
                .id(booking.getId())
                .resourceId(booking.getResource().getId())
                .resourceName(booking.getResource().getName())
                .resourceLocation(booking.getResource().getLocation())
                .userId(booking.getUser().getId())
                .userName(booking.getUser().getName())
                .bookingDate(booking.getBookingDate())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .purpose(booking.getPurpose())
                .attendees(booking.getAttendees())
                .status(booking.getStatus())
                .rejectionReason(booking.getRejectionReason())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}
