-- Drop the test table if it already exists
DROP TABLE IF EXISTS test;

-- Drop enumerated type if it already exists
DROP TYPE IF EXISTS enum_type;

-- Create enumerated type
CREATE TYPE enum_type AS ENUM('one', 'two', 'three', 'four');

-- Create the test table
CREATE TABLE test (
  id SERIAL PRIMARY KEY,
  f_boolean BOOLEAN,
  f_integer INTEGER,
  f_decimal DECIMAL(10, 4),
  f_date DATE,
  f_time TIME,
  f_timestamp TIMESTAMP,
  f_char CHAR(3),
  f_varchar VARCHAR(100),
  f_text TEXT,
  f_bytea BYTEA,
  f_enum enum_type,
  f_json JSON,
  f_array1 integer[],
  f_array2 TEXT[][],
  f_uuid UUID
);

