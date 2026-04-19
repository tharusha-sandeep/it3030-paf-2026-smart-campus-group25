package com.smartcampus.user;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public void deleteUser(UUID id, String currentAdminId) {
        if (id.toString().equals(currentAdminId)) {
            throw new RuntimeException("You cannot delete your own account.");
        }
        userRepository.deleteById(id);
    }
}
