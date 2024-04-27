-- Drop the test table if it already exists
DROP TABLE IF EXISTS test;

-- Create the test table
CREATE TABLE test (
  id BIGINT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
  f_decimal DECIMAL(10, 4),
  f_int INT,
  f_bit BIT,
  f_float FLOAT,
  f_real REAL,
  f_date DATE,
  f_datetime DATETIME,
  f_datetime2 DATETIME2,
  f_time TIME,
  f_char CHAR(3),
  f_varchar VARCHAR(100),
  f_nchar NCHAR(6),
  f_nvarchar NVARCHAR(MAX),
  f_varbinary VARBINARY(MAX),
  f_uniqueidentifier UNIQUEIDENTIFIER,
  f_nvarchar_json NVARCHAR(MAX)
);

