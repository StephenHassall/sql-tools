-- Delete any old records
DELETE FROM test;

-- Insert a new example record using different SQL values
INSERT INTO "TEST" (
  f_bool,
  f_char
--  f_nchar,
--  f_varchar2,
--  f_nvarchar2,
--  f_number,
--  f_float,
--  f_date,
--  f_binary_float,
--  f_binary_double,
--  f_timestamp,
--  f_raw,
--  f_long_raw,
--  f_clob,
--  f_blob
)
VALUES (
  1,
  'abc'
--  N'XYZ',
--  'this is a string with escape codes \"\'\\\n\r\t\b\f\l\g\a',
--  N'this is more text with\"double quotes\" and \'single quotes\'.',
--  12.3456,
--  3.142,
--  '2024-04-20 12:34:56',
--  2.718,
--  1.234,
--  '2024-04-20 12:34:56.123',
--  HEXTORAW('F0E1D2C3B4A5968778695A4B3C2D1E0F'),
--  HEXTORAW('00112233445566778899AABBCCDDEEFF'),
--  N'{ "property1": 123, "property2": "te\\"s\\\\t", "property3": "te\'st" }',
--  HEXTORAW('01234567890ABCFEF')
);
