-- Delete any old records
DELETE FROM test;

-- Insert a new example record using different SQL values
INSERT INTO "TEST" (
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
  1,
  'abc',
  N'XYZ',
  'this is a string with escape codes "''\	more [](){} NL ' || CHR(10) || ' CR ' || CHR(13) || ' end.',
  N'this is more text with"double quotes" and ''single quotes''.',
  12.3456,
  3.1,
  DATE '2024-04-20',
  2.718,
  1.234,
  TIMESTAMP '2024-04-20 12:34:56.123',
  HEXTORAW('F0E1D2C3B4A5968778695A4B3C2D1E0F'),
  HEXTORAW('00112233445566778899AABBCCDDEEFF'),
  N'{ "property1": 123, "property2": "te\"s\\t", "property3": "te''st" }',
  HEXTORAW('0123456789ABCDEF')
);
