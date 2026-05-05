package com.example.parking.controller;

import com.example.parking.model.User;
import com.example.parking.model.Booking;
import com.example.parking.model.Slot;
import com.example.parking.repository.UserRepository;
import com.example.parking.repository.BookingRepository;
import com.example.parking.repository.SlotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private SlotRepository slotRepository;

    @PostMapping("/auth/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
        }
        User saved = userRepository.save(user);
        return ResponseEntity.ok(Map.of("id", saved.getId(), "role", saved.getRole()));
    }

    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        return userRepository.findByEmail(credentials.get("email"))
                .filter(u -> u.getPassword().equals(credentials.get("password")))
                .map(u -> ResponseEntity.ok(Map.of(
                        "id", u.getId(),
                        "name", u.getName(),
                        "email", u.getEmail(),
                        "role", u.getRole()
                )))
                .orElseGet(() -> ResponseEntity.status(401).body(Map.of("error", "Invalid credentials")));
    }

    @PostMapping("/bookings")
    public ResponseEntity<?> createBooking(@RequestBody Map<String, Object> request) {
        Long userId = ((Number) request.get("userId")).longValue();
        Long slotId = ((Number) request.get("slotId")).longValue();
        
        return userRepository.findById(userId).flatMap(user ->
            slotRepository.findById(slotId).map(slot -> {
                if (slot.isOccupied()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Slot already occupied"));
                }
                Booking booking = new Booking();
                booking.setUser(user);
                booking.setSlot(slot);
                booking.setStartTime(LocalDateTime.now());
                booking.setStatus("ACTIVE");
                slot.setOccupied(true);
                slotRepository.save(slot);
                Booking saved = bookingRepository.save(booking);
                return ResponseEntity.ok(saved);
            })
        ).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/bookings/user/{userId}")
    public ResponseEntity<?> getUserBookings(@PathVariable Long userId) {
        List<Booking> bookings = bookingRepository.findByUserId(userId);
        return ResponseEntity.ok(bookings);
    }

    @DeleteMapping("/bookings/{bookingId}")
    public ResponseEntity<?> cancelBooking(@PathVariable Long bookingId) {
        return bookingRepository.findById(bookingId).map(booking -> {
            booking.setStatus("CANCELLED");
            Slot slot = booking.getSlot();
            slot.setOccupied(false);
            slotRepository.save(slot);
            bookingRepository.save(booking);
            return ResponseEntity.ok(Map.of("message", "Booking cancelled"));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
