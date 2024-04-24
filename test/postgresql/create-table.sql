-- Set database to use
USE sql_tools_test;

-- Drop the test table if it already exists
DROP TABLE IF EXISTS test;

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
  f_enum ENUM('one', 'two', 'three', 'four'),
  f_json JSON,
  f_array1 [],
  f_array2 [][],
  f_uuid UUID
);

