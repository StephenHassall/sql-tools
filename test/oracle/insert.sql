-- Delete any old records
DELETE FROM test;

-- Insert a new record using given values
INSERT INTO $testTable (
  F_BOOL,
  F_CHAR,
  F_NCHAR,
  F_VARCHAR2,
  F_NVARCHAR2,
  F_NUMBER,
  F_FLOAT,
  F_DATE,
  F_BINARY_FLOAT,
  F_BINARY_DOUBLE,
  F_TIMESTAMP,
  F_RAW,
  F_LONG_RAW,
  F_CLOB,
  F_BLOB
)
VALUES (
  $F_BOOL,
  $F_CHAR,
  $F_NCHAR,
  $F_VARCHAR2,
  $F_NVARCHAR2,
  $F_NUMBER,
  $F_FLOAT,
  $F_DATE,
  $F_BINARY_FLOAT,
  $F_BINARY_DOUBLE,
  $F_TIMESTAMP,
  $F_RAW,
  $F_LONG_RAW,
  $F_CLOB,
  $F_BLOB
);
