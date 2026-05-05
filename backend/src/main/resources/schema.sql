-- Minimal schema for reference. JPA will manage schema when spring.jpa.hibernate.ddl-auto=update
CREATE TABLE IF NOT EXISTS parking_lot (
  id serial PRIMARY KEY,
  name varchar(255),
  latitude double precision,
  longitude double precision
);

CREATE TABLE IF NOT EXISTS slot (
  id serial PRIMARY KEY,
  parking_lot_id int REFERENCES parking_lot(id),
  type varchar(50),
  covered boolean,
  ev_charging boolean,
  handicap boolean,
  occupied boolean
);
