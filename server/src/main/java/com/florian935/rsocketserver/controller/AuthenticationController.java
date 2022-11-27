package com.florian935.rsocketserver.controller;

import com.florian935.rsocketserver.domain.TokenResponse;
import com.florian935.rsocketserver.security.jwt.utils.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;
import reactor.core.publisher.Mono;

import static lombok.AccessLevel.PRIVATE;

@Controller
@RequiredArgsConstructor
@FieldDefaults(level = PRIVATE, makeFinal = true)
public class AuthenticationController {

    JwtTokenProvider jwtTokenProvider;

    @QueryMapping
    Mono<TokenResponse> authenticate() {

        return Mono.just(TokenResponse
                .builder()
                .token(jwtTokenProvider.generateToken())
                .build()
        );
    }
}
