package com.florian935.rsocketserver.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/ping")
public class PingController {

    @GetMapping
    Mono<String> ping() {
        return Mono.just("pong");
    }
}
