package com.smartcampus.ticket;

import com.smartcampus.ticket.dto.CreateTicketDTO;
import com.smartcampus.ticket.dto.TicketResponseDTO;
import com.smartcampus.ticket.dto.UpdateTicketDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    // POST /api/tickets  — create a new ticket (multipart for file uploads)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TicketResponseDTO> createTicket(
            @RequestPart("ticket") @Valid CreateTicketDTO dto,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.createTicket(dto, files, userId));
    }

    // GET /api/tickets/my  — get current user's tickets
    @GetMapping("/my")
    public ResponseEntity<List<TicketResponseDTO>> getMyTickets(Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(ticketService.getMyTickets(userId));
    }

    // GET /api/tickets  — admin: get all tickets
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TicketResponseDTO>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    // GET /api/tickets/{id}  — get ticket by ID
    @GetMapping("/{id}")
    public ResponseEntity<TicketResponseDTO> getTicketById(@PathVariable UUID id, Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(ticketService.getTicketById(id, userId));
    }

    // PATCH /api/tickets/{id}/status  — update status, assign, add notes
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TicketResponseDTO> updateStatus(
            @PathVariable UUID id,
            @RequestBody UpdateTicketDTO dto,
            Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, dto, userId));
    }

    // DELETE /api/tickets/{id}  — delete ticket (reporter or admin)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable UUID id, Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        ticketService.deleteTicket(id, userId);
        return ResponseEntity.noContent().build();
    }
}