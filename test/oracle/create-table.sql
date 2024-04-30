-- Drop the test table (you'll have to comment it out the first time this is called)
--DROP TABLE test;

-- Create the test table
CREATE TABLE test (
  id INTEGER GENERATED ALWAYS AS IDENTITY,
  f_bool NUMBER(1),
  f_char CHAR(3),
  f_nchar NCHAR(3),
  f_varchar2 VARCHAR2(100 CHAR),
  f_nvarchar2 NVARCHAR2(100),
  f_number NUMBER(10, 4),
  f_float FLOAT(4),
  f_date DATE,
  f_binary_float BINARY_FLOAT,
  f_binary_double BINARY_DOUBLE,
  f_timestamp TIMESTAMP,
  f_raw RAW(16),
  f_long_raw LONG RAW,
  f_rowid ROWID,
  f_clob CLOB,
  f_blob BLOB,
  PRIMARY KEY(id)
);