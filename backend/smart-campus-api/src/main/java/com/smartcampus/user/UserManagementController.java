package com.smartcampus.user;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class UserManagementController {

    private final UserRepository userRepository;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<UserManagementDTO>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserManagementDTO> getUserById(@PathVariable UUID id) {
        return userRepository.findById(id)
                .map(user -> ResponseEntity.ok(convertToDTO(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<UserManagementDTO> updateUserRole(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        return userRepository.findById(id)
                .map(user -> {
                    try {
                        String roleStr = body.get("role");
                        user.setRole(AppRole.valueOf(roleStr));
                        return ResponseEntity.ok(convertToDTO(userRepository.save(user)));
                    } catch (Exception e) {
                        return ResponseEntity.badRequest().<UserManagementDTO>build();
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<UserManagementDTO> updateUserStatus(@PathVariable UUID id, @RequestBody Map<String, Boolean> body) {
        return userRepository.findById(id)
                .map(user -> {
                    Boolean enabled = body.get("enabled");
                    if (enabled == null) return ResponseEntity.badRequest().<UserManagementDTO>build();
                    user.setEnabled(enabled);
                    return ResponseEntity.ok(convertToDTO(userRepository.save(user)));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id, Authentication authentication) {
        try {
            String currentAdminId = (String) authentication.getPrincipal();
            userService.deleteUser(id, currentAdminId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    private UserManagementDTO convertToDTO(AppUser user) {
        return UserManagementDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .enabled(user.isEnabled())
                .createdAt(user.getCreatedAt())
                .authProvider(user.getAuthProvider())
                .profilePicture(user.getProfilePicture())
                .build();
    }
}
