package com.florian935.rsocketserver.controller;

import com.florian935.rsocketserver.domain.TokenResponse;
import com.florian935.rsocketserver.security.jwt.utils.JwtTokenProvider;
import io.rsocket.exceptions.RejectedSetupException;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.rsocket.RSocketRequester;
import org.springframework.messaging.rsocket.annotation.ConnectMapping;
import org.springframework.stereotype.Controller;
import reactor.core.publisher.Mono;

import static lombok.AccessLevel.PRIVATE;

@Controller
@RequiredArgsConstructor
@FieldDefaults(level = PRIVATE, makeFinal = true)
public class AuthenticationController {

    @ConnectMapping("connect.setup")
    Mono<Void> connectSetup(@Payload Mono<String> apiKey, RSocketRequester requester) {
        return apiKey
                // Log client status connection
                .doOnNext(key ->
                        requester
                                .rsocket()
                                .onClose()
                                .doFirst(() -> {
                                    System.out.println("Client CONNECTED.");
                                })
                                .doOnError(error -> {
                                    System.out.println("Channel to client CLOSED.");
                                })
                                .doFinally(consumer -> {
                                    System.out.println("Client DISCONNECTED");
                                })
                                .subscribe())
                // If valid api key, connection is established, else can't connect to RSocket.
                .flatMap(key ->
                        "2a33f36d-da5d-4b84-9b63-fd868b84dfd8".equals(key)
                                ? Mono.empty()
                                : Mono.error(new RejectedSetupException("connection is not authenticated"))
                );
    }

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
