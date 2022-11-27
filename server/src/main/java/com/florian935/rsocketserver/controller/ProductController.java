package com.florian935.rsocketserver.controller;

import com.florian935.rsocketserver.domain.Product;
import lombok.extern.slf4j.Slf4j;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SubscriptionMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;

@Controller
@Slf4j
public class ProductController {

    @QueryMapping
    @PreAuthorize("hasRole('USER')")
    Mono<Product> productById(@Argument String id) {
        return Mono.just(new Product(id, "Product 1", 100));
    }

    @SubscriptionMapping
    @PreAuthorize("isAuthenticated()")
    Flux<Product> products(@Argument List<String> ids) {
        return Flux.fromIterable(ids)
                .map(id -> new Product(id, "Product" + id, 100));
    }
}
