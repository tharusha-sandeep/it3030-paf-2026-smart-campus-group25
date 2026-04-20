package com.smartcampus.booking;

import com.smartcampus.user.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserOrderByCreatedAtDesc(AppUser user);

    List<Booking> findByResourceIdOrderByCreatedAtDesc(Long resourceId);

    /**
     * Check for overlapping bookings on the same resource and date,
     * excluding a given booking id (useful for updates; pass -1 to exclude none).
     */
    @Query("SELECT b FROM Booking b WHERE " +
           "b.resource.id = :resourceId AND " +
           "b.bookingDate = :bookingDate AND " +
           "b.id <> :excludeId AND " +
           "b.status NOT IN (com.smartcampus.booking.BookingStatus.CANCELLED, com.smartcampus.booking.BookingStatus.REJECTED) AND " +
           "b.startTime < :endTime AND b.endTime > :startTime")
    List<Booking> findOverlappingBookings(@Param("resourceId") Long resourceId,
                                          @Param("bookingDate") LocalDate bookingDate,
                                          @Param("startTime") LocalTime startTime,
                                          @Param("endTime") LocalTime endTime,
                                          @Param("excludeId") Long excludeId);

    /**
     * Admin: filter by optional status, date, and resourceId.
     */
    @Query("SELECT b FROM Booking b WHERE " +
           "(:status IS NULL OR b.status = :status) AND " +
           "(:bookingDate IS NULL OR b.bookingDate = :bookingDate) AND " +
           "(:resourceId IS NULL OR b.resource.id = :resourceId) " +
           "ORDER BY b.createdAt DESC")
    List<Booking> findAllWithFilters(@Param("status") BookingStatus status,
                                     @Param("bookingDate") LocalDate bookingDate,
                                     @Param("resourceId") Long resourceId);

    /**
     * Get all bookings for a specific user UUID.
     */
    @Query("SELECT b FROM Booking b WHERE b.user.id = :userId ORDER BY b.createdAt DESC")
    List<Booking> findByUserId(@Param("userId") UUID userId);
}
