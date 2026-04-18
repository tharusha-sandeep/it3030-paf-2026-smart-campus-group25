package com.smartcampus.comment;

import com.smartcampus.comment.dto.CommentResponseDTO;
import com.smartcampus.comment.dto.CreateCommentDTO;
import com.smartcampus.notification.NotificationService;
import com.smartcampus.ticket.Ticket;
import com.smartcampus.ticket.TicketRepository;
import com.smartcampus.user.AppRole;
import com.smartcampus.user.AppUser;
import com.smartcampus.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class TicketCommentService {

    private final TicketCommentRepository commentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public TicketCommentService(TicketCommentRepository commentRepository,
                                TicketRepository ticketRepository,
                                UserRepository userRepository,
                                NotificationService notificationService) {
        this.commentRepository = commentRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public CommentResponseDTO addComment(UUID ticketId, CreateCommentDTO dto, UUID authorId) {
        Ticket ticket = getTicket(ticketId);
        AppUser author = getUser(authorId);

        TicketComment comment = TicketComment.builder()
                .ticket(ticket)
                .author(author)
                .content(dto.content())
                .build();

        comment = commentRepository.save(comment);

        // Notify reporter if someone else commented
        if (!ticket.getReporter().getId().equals(authorId)) {
            notificationService.createNotification(
                ticket.getReporter(),
                author.getName() + " commented on your ticket: " + ticket.getTitle(),
                "NEW_COMMENT",
                ticketId.toString()
            );
        }

        return toDTO(comment);
    }

    public List<CommentResponseDTO> getComments(UUID ticketId) {
        Ticket ticket = getTicket(ticketId);
        return commentRepository.findByTicketOrderByCreatedAtAsc(ticket)
                .stream().map(this::toDTO).toList();
    }

    public CommentResponseDTO editComment(UUID commentId, CreateCommentDTO dto, UUID requesterId) {
        TicketComment comment = getComment(commentId);
        if (!comment.getAuthor().getId().equals(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot edit another user's comment");
        }
        comment.setContent(dto.content());
        return toDTO(commentRepository.save(comment));
    }

    public void deleteComment(UUID commentId, UUID requesterId) {
        TicketComment comment = getComment(commentId);
        AppUser requester = getUser(requesterId);
        boolean isOwner = comment.getAuthor().getId().equals(requesterId);
        boolean isAdmin = requester.getRole() == AppRole.ADMIN;
        if (!isOwner && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot delete this comment");
        }
        commentRepository.delete(comment);
    }

    private Ticket getTicket(UUID id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));
    }

    private AppUser getUser(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private TicketComment getComment(UUID id) {
        return commentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));
    }

    public CommentResponseDTO toDTO(TicketComment c) {
        return new CommentResponseDTO(
                c.getId(),
                c.getTicket().getId(),
                c.getAuthor().getId(),
                c.getAuthor().getName(),
                c.getContent(),
                c.getCreatedAt(),
                c.getUpdatedAt()
        );
    }
}