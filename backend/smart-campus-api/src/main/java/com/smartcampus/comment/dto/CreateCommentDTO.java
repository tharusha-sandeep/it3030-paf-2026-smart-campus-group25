package com.smartcampus.comment.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateCommentDTO(
    @NotBlank String content
) {}