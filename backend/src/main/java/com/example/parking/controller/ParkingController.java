package com.example.parking.controller;

import com.example.parking.model.ParkingLot;
import com.example.parking.model.Slot;
import com.example.parking.repository.ParkingLotRepository;
import com.example.parking.repository.SlotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = "*")
public class ParkingController {

    @Autowired
    private ParkingLotRepository parkingLotRepository;

    @Autowired
    private SlotRepository slotRepository;

    @GetMapping("/parking")
    public ResponseEntity<?> search(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Boolean covered,
            @RequestParam(required = false) Boolean evCharging,
            @RequestParam(required = false) Boolean handicap,
            @RequestParam(required = false) Boolean availableOnly) {
        List<ParkingLot> lots = parkingLotRepository.findAll();
        
        // Add stats to each lot
        List<Map<String, Object>> response = lots.stream().map(lot -> {
            List<Slot> lotSlots = slotRepository.findByParkingLotId(lot.getId());
            
            // Apply filters
            List<Slot> filtered = lotSlots.stream()
                .filter(s -> covered == null || s.isCovered() == covered)
                .filter(s -> evCharging == null || s.isEvCharging() == evCharging)
                .filter(s -> handicap == null || s.isHandicap() == handicap)
                .filter(s -> availableOnly == null || !s.isOccupied() == availableOnly)
                .collect(Collectors.toList());
            
            Map<String, Object> lotData = new HashMap<>();
            lotData.put("id", lot.getId());
            lotData.put("name", lot.getName());
            lotData.put("latitude", lot.getLatitude());
            lotData.put("longitude", lot.getLongitude());
            lotData.put("totalSlots", lotSlots.size());
            lotData.put("availableSlots", (int) lotSlots.stream().filter(s -> !s.isOccupied()).count());
            lotData.put("filteredSlots", filtered.size());
            return lotData;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/parking/{id}")
    public ResponseEntity<?> getParkingLot(@PathVariable Long id) {
        return parkingLotRepository.findById(id).map(lot -> {
            List<Slot> slots = slotRepository.findByParkingLotId(id);
            Map<String, Object> data = new HashMap<>();
            data.put("lot", lot);
            data.put("slots", slots);
            data.put("totalSlots", slots.size());
            data.put("availableSlots", (int) slots.stream().filter(s -> !s.isOccupied()).count());
            return ResponseEntity.ok(data);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/parking/{id}/slots")
    public List<Slot> slots(@PathVariable Long id) {
        return slotRepository.findByParkingLotId(id);
    }

    @GetMapping("/parking/{id}/slots/available")
    public List<Slot> availableSlots(@PathVariable Long id) {
        return slotRepository.findByParkingLotId(id).stream()
                .filter(s -> !s.isOccupied())
                .collect(Collectors.toList());
    }
}

