package com.smartcampus.booking;

import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    /**
     * POST /api/bookings — Create a booking (authenticated users).
     */
    @PostMapping
    public ResponseEntity<BookingResponseDTO> createBooking(@Valid @RequestBody BookingRequestDTO dto) {
        String userId = getAuthenticatedUserId();
        BookingResponseDTO created = bookingService.createBooking(dto, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * GET /api/bookings/my — Get logged-in user's bookings.
     */
    @GetMapping("/my")
    public ResponseEntity<List<BookingResponseDTO>> getMyBookings() {
        String userId = getAuthenticatedUserId();
        return ResponseEntity.ok(bookingService.getUserBookings(userId));
    }

    /**
     * GET /api/bookings — Get all bookings with optional filters (ADMIN only).
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookingResponseDTO>> getAllBookings(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate bookingDate,
            @RequestParam(required = false) Long resourceId) {
        return ResponseEntity.ok(bookingService.getAllBookings(status, bookingDate, resourceId));
    }

    /**
     * PUT /api/bookings/{id}/approve — Approve a booking (ADMIN only).
     */
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponseDTO> approveBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.approveBooking(id));
    }

    /**
     * PUT /api/bookings/{id}/reject — Reject a booking with reason (ADMIN only).
     */
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponseDTO> rejectBooking(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String reason = body.getOrDefault("rejectionReason", "No reason provided");
        return ResponseEntity.ok(bookingService.rejectBooking(id, reason));
    }

    /**
     * PUT /api/bookings/{id}/cancel — Cancel own booking (authenticated user).
     */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<BookingResponseDTO> cancelBooking(@PathVariable Long id) {
        String userId = getAuthenticatedUserId();
        return ResponseEntity.ok(bookingService.cancelBooking(id, userId));
    }

    // ── Helper ──────────────────────────────────────────────────────────────

    private String getAuthenticatedUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new org.springframework.web.server.ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        return authentication.getName(); // Returns user UUID (set in JwtAuthenticationFilter)
    }
}
