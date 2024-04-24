-- Set database to use
USE sql_tools_test;

-- Drop the test table if it already exists
DROP TABLE IF EXISTS test;

-- Create the test table
CREATE TABLE test (
  id SERIAL PRIMARY KEY,
  f_bool BOOL,
  f_int INT,
  f_decimal DECIMAL(10, 4),
  f_date DATE,
  f_time TIME,
  f_datetime DATETIME,
  f_datetime_millisecond DATETIME(3),
  f_timestamp TIMESTAMP,
  f_year YEAR,
  f_char CHAR(3),
  f_varchar VARCHAR(100),
  f_blob BLOB,
  f_text TEXT,
  f_enum ENUM('one', 'two', 'three', 'four'),
  f_json JSON
);

