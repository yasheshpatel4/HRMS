package com.example.hrms_backend.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    private static final String SECRET = "5367566859703373367639792F423F452848284D6251655468576D5A71347437";
    private static final long EXPIRATION = 1000 * 60 * 30; // 30 mins

    public String generateToken(String email) {
        return Jwts.builder()
                .setClaims(Map.of())
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION))
                .signWith(getSignKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> resolver) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSignKey()).build()
                .parseClaimsJws(token).getBody();
        return resolver.apply(claims);
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        String username = extractUsername(token);
        boolean isExpired = extractClaim(token, Claims::getExpiration).before(new Date());
        return (username.equals(userDetails.getUsername()) && !isExpired);
    }

    private Key getSignKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(SECRET));
    }
}
