package com.example.parking.repository;

import com.example.parking.model.Slot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SlotRepository extends JpaRepository<Slot, Long> {
    List<Slot> findByParkingLotId(Long parkingLotId);
}
