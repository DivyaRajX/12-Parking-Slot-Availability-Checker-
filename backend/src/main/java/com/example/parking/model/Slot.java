package com.example.parking.model;

import javax.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
public class Slot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "parking_lot_id")
    @JsonIgnore
    private ParkingLot parkingLot;

    private String type; // COVERED, OPEN, EV, HANDICAP
    private boolean covered;
    private boolean evCharging;
    private boolean handicap;
    private boolean occupied;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ParkingLot getParkingLot() { return parkingLot; }
    public void setParkingLot(ParkingLot parkingLot) { this.parkingLot = parkingLot; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public boolean isCovered() { return covered; }
    public void setCovered(boolean covered) { this.covered = covered; }
    public boolean isEvCharging() { return evCharging; }
    public void setEvCharging(boolean evCharging) { this.evCharging = evCharging; }
    public boolean isHandicap() { return handicap; }
    public void setHandicap(boolean handicap) { this.handicap = handicap; }
    public boolean isOccupied() { return occupied; }
    public void setOccupied(boolean occupied) { this.occupied = occupied; }
}
