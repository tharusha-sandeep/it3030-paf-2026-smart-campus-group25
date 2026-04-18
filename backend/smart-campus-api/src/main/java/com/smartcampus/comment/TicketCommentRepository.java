package com.smartcampus.comment;

import com.smartcampus.ticket.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TicketCommentRepository extends JpaRepository<TicketComment, UUID> {
    List<TicketComment> findByTicketOrderByCreatedAtAsc(Ticket ticket);
}