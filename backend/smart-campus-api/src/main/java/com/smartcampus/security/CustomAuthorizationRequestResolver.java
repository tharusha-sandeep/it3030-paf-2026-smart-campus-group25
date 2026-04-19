package com.smartcampus.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;

import java.util.LinkedHashMap;
import java.util.Map;

public class CustomAuthorizationRequestResolver implements OAuth2AuthorizationRequestResolver {

    private final OAuth2AuthorizationRequestResolver defaultResolver;

    public CustomAuthorizationRequestResolver(ClientRegistrationRepository repo) {
        this.defaultResolver = new DefaultOAuth2AuthorizationRequestResolver(repo, "/oauth2/authorization");
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
        OAuth2AuthorizationRequest authRequest = this.defaultResolver.resolve(request);
        return authRequest != null ? customizeAuthorizationRequest(authRequest) : null;
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request, String clientRegistrationId) {
        OAuth2AuthorizationRequest authRequest = this.defaultResolver.resolve(request, clientRegistrationId);
        return authRequest != null ? customizeAuthorizationRequest(authRequest) : null;
    }

    private OAuth2AuthorizationRequest customizeAuthorizationRequest(OAuth2AuthorizationRequest authRequest) {
        Map<String, Object> additionalParameters = new LinkedHashMap<>(authRequest.getAdditionalParameters());
        additionalParameters.put("prompt", "select_account");

        return OAuth2AuthorizationRequest.from(authRequest)
                .additionalParameters(additionalParameters)
                .build();
    }
}
