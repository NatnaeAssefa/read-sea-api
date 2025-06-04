# Boingo API

## Functionality
- Handle things


CREATE EXTENSION postgis;

CREATE INDEX idx_location_geography ON properties USING GIST(location);