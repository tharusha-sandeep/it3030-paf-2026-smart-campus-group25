package com.smartcampus.ticket;

import com.smartcampus.notification.NotificationService;
import com.smartcampus.resource.ResourceRepository;
import com.smartcampus.ticket.dto.CreateTicketDTO;
import com.smartcampus.ticket.dto.TicketResponseDTO;
import com.smartcampus.ticket.dto.UpdateTicketDTO;
import com.smartcampus.user.AppRole;
import com.smartcampus.user.AppUser;
import com.smartcampus.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class TicketService {

    private static final String UPLOAD_DIR = "uploads/tickets/";

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final ResourceRepository resourceRepository;

    public TicketService(TicketRepository ticketRepository,
                         UserRepository userRepository,
                         NotificationService notificationService,
                         ResourceRepository resourceRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.resourceRepository = resourceRepository;
    }

    public TicketResponseDTO createTicket(CreateTicketDTO dto, List<MultipartFile> files, UUID reporterId) {
        AppUser reporter = getUser(reporterId);

        List<String> savedPaths = new ArrayList<>();
        if (files != null) {
            if (files.size() > 3) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Maximum 3 attachments allowed");
            for (MultipartFile file : files) {
                savedPaths.add(saveFile(file, reporterId));
            }
        }

        // Resolve resource name if resourceId provided
        String resourceName = null;
        if (dto.resourceId() != null) {
            resourceName = resourceRepository.findById(dto.resourceId())
                    .map(r -> r.getName())
                    .orElse(null);
        }

        Ticket ticket = Ticket.builder()
                .reporter(reporter)
                .title(dto.title())
                .description(dto.description())
                .location(dto.location())
                .category(dto.category())
                .priority(dto.priority())
                .contactDetails(dto.contactDetails())
                .status(TicketStatus.OPEN)
                .attachmentPaths(String.join(",", savedPaths))
                .resourceId(dto.resourceId())
                .resourceName(resourceName)
                .build();

        ticket = ticketRepository.save(ticket);
        return toDTO(ticket);
    }

    public List<TicketResponseDTO> getMyTickets(UUID userId) {
        AppUser user = getUser(userId);
        return ticketRepository.findByReporterOrderByCreatedAtDesc(user)
                .stream().map(this::toDTO).toList();
    }

    public List<TicketResponseDTO> getAllTickets() {
        return ticketRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toDTO).toList();
    }

    public TicketResponseDTO getTicketById(UUID ticketId, UUID requesterId) {
        Ticket ticket = getTicket(ticketId);
        AppUser requester = getUser(requesterId);
        if (!ticket.getReporter().getId().equals(requesterId) && requester.getRole() != AppRole.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return toDTO(ticket);
    }

    public TicketResponseDTO updateTicketStatus(UUID ticketId, UpdateTicketDTO dto, UUID updaterId) {
        Ticket ticket = getTicket(ticketId);

        if (dto.status() != null) ticket.setStatus(dto.status());
        if (dto.resolutionNotes() != null) ticket.setResolutionNotes(dto.resolutionNotes());
        if (dto.rejectionReason() != null) ticket.setRejectionReason(dto.rejectionReason());
        if (dto.assigneeId() != null) {
            AppUser assignee = getUser(dto.assigneeId());
            ticket.setAssignee(assignee);
        }

        ticket = ticketRepository.save(ticket);

        if (dto.status() != null) {
            notificationService.createNotification(
                ticket.getReporter(),
                "Ticket \"" + ticket.getTitle() + "\" status updated to " + dto.status(),
                "TICKET_STATUS",
                ticket.getId().toString()
            );
        }

        return toDTO(ticket);
    }

    public void deleteTicket(UUID ticketId, UUID requesterId) {
        Ticket ticket = getTicket(ticketId);
        AppUser requester = getUser(requesterId);
        if (!ticket.getReporter().getId().equals(requesterId) && requester.getRole() != AppRole.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        ticketRepository.delete(ticket);
    }

    private String saveFile(MultipartFile file, UUID userId) {
        try {
            Path dir = Paths.get(UPLOAD_DIR + userId.toString());
            Files.createDirectories(dir);
            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path dest = dir.resolve(filename);
            Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);
            return dest.toString();
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to save attachment");
        }
    }

    private Ticket getTicket(UUID id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));
    }

    private AppUser getUser(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    public TicketResponseDTO toDTO(Ticket t) {
        return new TicketResponseDTO(
                t.getId(),
                t.getReporter().getId(),
                t.getReporter().getName(),
                t.getAssignee() != null ? t.getAssignee().getId() : null,
                t.getAssignee() != null ? t.getAssignee().getName() : null,
                t.getTitle(),
                t.getDescription(),
                t.getLocation(),
                t.getResourceId(),
                t.getResourceName(),
                t.getCategory(),
                t.getPriority(),
                t.getStatus(),
                t.getContactDetails(),
                t.getAttachments(),
                t.getResolutionNotes(),
                t.getRejectionReason(),
                t.getCreatedAt(),
                t.getUpdatedAt()
        );
    }
}