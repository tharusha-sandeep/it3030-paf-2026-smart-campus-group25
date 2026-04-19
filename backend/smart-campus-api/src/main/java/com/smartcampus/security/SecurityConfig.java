package com.smartcampus.security;

import com.smartcampus.user.AppRole;
import com.smartcampus.user.AppUser;
import com.smartcampus.user.AuthProvider;
import com.smartcampus.user.UserRepository;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final BCryptPasswordEncoder passwordEncoder;
    private final ClientRegistrationRepository clientRegistrationRepository;

    public SecurityConfig(UserRepository userRepository,
                          JwtUtils jwtUtils,
                          JwtAuthenticationFilter jwtAuthenticationFilter,
                          BCryptPasswordEncoder passwordEncoder,
                          ClientRegistrationRepository clientRegistrationRepository) {
        this.userRepository = userRepository;
        this.jwtUtils = jwtUtils;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.passwordEncoder = passwordEncoder;
        this.clientRegistrationRepository = clientRegistrationRepository;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/login", "/api/auth/register", "/oauth2/**", "/login/**").permitAll()
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        .authorizationEndpoint(auth -> auth
                                .authorizationRequestResolver(new CustomAuthorizationRequestResolver(clientRegistrationRepository))
                        )
                        .successHandler(new SimpleUrlAuthenticationSuccessHandler() {
                            @Override
                            public void onAuthenticationSuccess(jakarta.servlet.http.HttpServletRequest request,
                                                                jakarta.servlet.http.HttpServletResponse response,
                                                                org.springframework.security.core.Authentication authentication)
                                    throws java.io.IOException {
                                OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
                                String email = oauth2User.getAttribute("email");
                                String name = oauth2User.getAttribute("name");
                                String picture = oauth2User.getAttribute("picture");

                                AppUser user = userRepository.findByEmail(email)
                                        .orElseGet(() -> userRepository.save(
                                                AppUser.builder()
                                                        .email(email)
                                                        .name(name)
                                                        .profilePicture(picture)
                                                        .role(AppRole.USER)
                                                        .authProvider(AuthProvider.GOOGLE)
                                                        .build()
                                        ));

                                String jwt = jwtUtils.generateToken(user);
                                getRedirectStrategy().sendRedirect(request, response, "http://localhost:5173/auth/callback?token=" + jwt);
                            }
                        })
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"status\": 401, \"message\": \"Unauthorized\"}");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"status\": 403, \"message\": \"Access Denied\"}");
                        })
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
