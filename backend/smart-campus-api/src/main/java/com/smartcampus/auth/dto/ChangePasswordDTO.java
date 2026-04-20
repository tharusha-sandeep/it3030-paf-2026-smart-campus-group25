package com.smartcampus.auth.dto;

public record ChangePasswordDTO(
    String currentPassword,
    String newPassword
) {}
