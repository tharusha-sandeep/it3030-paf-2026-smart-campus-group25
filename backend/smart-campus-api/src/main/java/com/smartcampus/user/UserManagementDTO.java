package com.smartcampus.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserManagementDTO {
    private UUID id;
    private String name;
    private String email;
    private AppRole role;
    private boolean enabled;
    private LocalDateTime createdAt;
    private AuthProvider authProvider;
    private String profilePicture;
}
