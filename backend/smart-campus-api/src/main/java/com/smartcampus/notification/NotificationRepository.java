package com.smartcampus.notification;

import com.smartcampus.user.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findByUserOrderByCreatedAtDesc(AppUser user);
    long countByUserAndReadFalse(AppUser user);
}