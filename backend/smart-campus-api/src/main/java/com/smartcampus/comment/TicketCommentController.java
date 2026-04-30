package com.smartcampus.comment;

import com.smartcampus.comment.dto.CommentResponseDTO;
import com.smartcampus.comment.dto.CreateCommentDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tickets/{ticketId}/comments")
public class TicketCommentController {

    private final TicketCommentService commentService;

    public TicketCommentController(TicketCommentService commentService) {
        this.commentService = commentService;
    }

    // POST /api/tickets/{ticketId}/comments
    @PostMapping
    public ResponseEntity<CommentResponseDTO> addComment(
            @PathVariable UUID ticketId,
            @RequestBody @Valid CreateCommentDTO dto,
            Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(commentService.addComment(ticketId, dto, userId));
    }

    // GET /api/tickets/{ticketId}/comments
    @GetMapping
    public ResponseEntity<List<CommentResponseDTO>> getComments(@PathVariable UUID ticketId) {
        return ResponseEntity.ok(commentService.getComments(ticketId));
    }

    // PUT /api/tickets/{ticketId}/comments/{commentId}
    @PutMapping("/{commentId}")
    public ResponseEntity<CommentResponseDTO> editComment(
            @PathVariable UUID ticketId,
            @PathVariable UUID commentId,
            @RequestBody @Valid CreateCommentDTO dto,
            Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(commentService.editComment(commentId, dto, userId));
    }

    // DELETE /api/tickets/{ticketId}/comments/{commentId}
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable UUID ticketId,
            @PathVariable UUID commentId,
            Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        commentService.deleteComment(commentId, userId);
        return ResponseEntity.noContent().build();
    }
}