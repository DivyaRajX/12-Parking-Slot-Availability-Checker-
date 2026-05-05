package com.example.parking.config;

import com.example.parking.model.ParkingLot;
import com.example.parking.model.Slot;
import com.example.parking.model.User;
import com.example.parking.repository.ParkingLotRepository;
import com.example.parking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private ParkingLotRepository parkingLotRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        // Create test users
        User driver = new User();
        driver.setName("John Driver");
        driver.setEmail("driver@test.com");
        driver.setPassword("password123");
        driver.setRole("DRIVER");
        userRepository.save(driver);

        User manager = new User();
        manager.setName("Jane Manager");
        manager.setEmail("manager@test.com");
        manager.setPassword("password123");
        manager.setRole("MANAGER");
        userRepository.save(manager);

        // Create parking lots
        ParkingLot lot1 = new ParkingLot();
        lot1.setName("Downtown Garage");
        lot1.setLatitude(40.7128);
        lot1.setLongitude(-74.0060);

        List<Slot> slots1 = new ArrayList<>();
        for (int i = 1; i <= 20; i++) {
            Slot s = new Slot();
            s.setParkingLot(lot1);
            s.setType("STANDARD");
            s.setCovered(i % 3 == 0);
            s.setEvCharging(i % 5 == 0);
            s.setHandicap(i % 10 == 0);
            s.setOccupied(i <= 8);
            slots1.add(s);
        }
        lot1.setSlots(slots1);
        parkingLotRepository.save(lot1);

        ParkingLot lot2 = new ParkingLot();
        lot2.setName("Airport Parking");
        lot2.setLatitude(40.7769);
        lot2.setLongitude(-73.8740);

        List<Slot> slots2 = new ArrayList<>();
        for (int i = 1; i <= 30; i++) {
            Slot s = new Slot();
            s.setParkingLot(lot2);
            s.setType("STANDARD");
            s.setCovered(i % 2 == 0);
            s.setEvCharging(i % 4 == 0);
            s.setHandicap(i % 15 == 0);
            s.setOccupied(i <= 12);
            slots2.add(s);
        }
        lot2.setSlots(slots2);
        parkingLotRepository.save(lot2);

        ParkingLot lot3 = new ParkingLot();
        lot3.setName("Mall Parking");
        lot3.setLatitude(40.7580);
        lot3.setLongitude(-73.9855);

        List<Slot> slots3 = new ArrayList<>();
        for (int i = 1; i <= 15; i++) {
            Slot s = new Slot();
            s.setParkingLot(lot3);
            s.setType("OPEN");
            s.setCovered(false);
            s.setEvCharging(i % 6 == 0);
            s.setHandicap(i % 8 == 0);
            s.setOccupied(i <= 5);
            slots3.add(s);
        }
        lot3.setSlots(slots3);
        parkingLotRepository.save(lot3);
    }
}
