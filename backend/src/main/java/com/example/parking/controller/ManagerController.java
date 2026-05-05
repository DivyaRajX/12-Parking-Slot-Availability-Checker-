package com.example.parking.controller;

import com.example.parking.model.ParkingLot;
import com.example.parking.model.Slot;
import com.example.parking.repository.ParkingLotRepository;
import com.example.parking.repository.SlotRepository;
import com.example.parking.ws.SlotWebSocketHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/manager")
public class ManagerController {

    @Autowired
    private SlotRepository slotRepository;

    @Autowired
    private ParkingLotRepository parkingLotRepository;

    @Autowired
    private SlotWebSocketHandler ws;

    @PostMapping("/parking")
    public ResponseEntity<?> createParking(@RequestBody Map<String, Object> body) {
        ParkingLot lot = new ParkingLot();
        lot.setName((String) body.get("name"));
        lot.setLatitude(((Number) body.get("latitude")).doubleValue());
        lot.setLongitude(((Number) body.get("longitude")).doubleValue());
        
        ParkingLot saved = parkingLotRepository.save(lot);
        
        // Create slots
        int numSlots = ((Number) body.getOrDefault("numSlots", 10)).intValue();
        List<Slot> slots = new ArrayList<>();
        for (int i = 0; i < numSlots; i++) {
            Slot s = new Slot();
            s.setParkingLot(saved);
            s.setType("STANDARD");
            s.setCovered(i % 3 == 0);
            s.setEvCharging(i % 4 == 0);
            s.setHandicap(i % 10 == 0);
            s.setOccupied(false);
            slots.add(s);
        }
        slotRepository.saveAll(slots);
        
        return ResponseEntity.ok(Map.of("id", saved.getId(), "message", "Parking lot registered"));
    }

    @PutMapping("/slots/{id}/status")
    public ResponseEntity<?> updateSlotStatus(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return slotRepository.findById(id).map(slot -> {
            Boolean occupied = (Boolean) body.getOrDefault("occupied", slot.isOccupied());
            slot.setOccupied(occupied);
            slotRepository.save(slot);

            Map<String, Object> payload = new HashMap<>();
            payload.put("type", "slot_update");
            payload.put("slotId", slot.getId());
            payload.put("occupied", slot.isOccupied());
            payload.put("timestamp", System.currentTimeMillis());
            ws.broadcast(payload);

            return ResponseEntity.ok(slot);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/occupancy/{lotId}")
    public ResponseEntity<?> getOccupancy(@PathVariable Long lotId) {
        List<Slot> slots = slotRepository.findByParkingLotId(lotId);
        long occupied = slots.stream().filter(Slot::isOccupied).count();
        Map<String, Object> data = new HashMap<>();
        data.put("totalSlots", slots.size());
        data.put("occupiedSlots", occupied);
        data.put("availableSlots", slots.size() - occupied);
        data.put("occupancyRate", slots.isEmpty() ? 0 : (occupied * 100.0 / slots.size()));
        return ResponseEntity.ok(data);
    }

    @GetMapping("/analytics/{lotId}")
    public ResponseEntity<?> getAnalytics(@PathVariable Long lotId) {
        List<Slot> slots = slotRepository.findByParkingLotId(lotId);
        Map<String, Object> analytics = new HashMap<>();
        analytics.put("total", slots.size());
        analytics.put("occupied", (int) slots.stream().filter(Slot::isOccupied).count());
        analytics.put("available", (int) slots.stream().filter(s -> !s.isOccupied()).count());
        analytics.put("covered", (int) slots.stream().filter(Slot::isCovered).count());
        analytics.put("evCharging", (int) slots.stream().filter(Slot::isEvCharging).count());
        analytics.put("handicap", (int) slots.stream().filter(Slot::isHandicap).count());
        return ResponseEntity.ok(analytics);
    }
}
