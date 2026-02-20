package com.cirquetask.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.core.Ordered;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Rate limits /api/auth/login and /api/auth/register by client IP to mitigate brute-force.
 * Default: 5 attempts per minute per IP.
 */
@Component
@Slf4j
public class AuthRateLimitFilter extends OncePerRequestFilter implements Ordered {

    private static final int ORDER = 1;

    @Override
    public int getOrder() {
        return ORDER;
    }

    private static final int MAX_REQUESTS_PER_MINUTE = 5;
    private static final long WINDOW_MS = 60_000;

    private final ConcurrentHashMap<String, Window> store = new ConcurrentHashMap<>();

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return !path.equals("/api/auth/login") && !path.equals("/api/auth/register");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String key = clientKey(request);
        Window window = store.computeIfAbsent(key, k -> new Window());

        if (!window.tryAcquire()) {
            log.warn("Rate limit exceeded for auth endpoint, key={}", key);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write("{\"success\":false,\"message\":\"Too many attempts. Please try again later.\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private static String clientKey(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private static class Window {
        private final AtomicInteger count = new AtomicInteger(0);
        private volatile long windowStart = System.currentTimeMillis();

        synchronized boolean tryAcquire() {
            long now = System.currentTimeMillis();
            if (now - windowStart >= WINDOW_MS) {
                windowStart = now;
                count.set(0);
            }
            if (count.get() >= MAX_REQUESTS_PER_MINUTE) {
                return false;
            }
            count.incrementAndGet();
            return true;
        }
    }
}
