-- Set database to use
USE sql_tools_test;

-- Delete any old records
DELETE FROM test where id!=-1;

-- Insert a new example record using different SQL values
INSERT INTO test (
  f_bool,
  f_int,
  f_decimal,
  f_date,
  f_time,
  f_datetime,
  f_datetime_millisecond,
  f_timestamp,
  f_year,
  f_char,
  f_varchar,
  f_blob,
  f_text,
  f_enum,
  f_json
)
VALUES (
  TRUE,
  123,
  12.3456,
  '2024-04-19',
  '12:34:56',
  '2024-04-20 12:34:56',
  '2024-04-20 12:34:56.123',
  '2024-04-26 11:22:33',
  2024,
  'abc',
  'this is a string with escape codes \0\b\t\n\r\Z\"\'\\',
  X'F0E1D2C3B4A5968778695A4B3C2D1E0F',
  'this is more text with\"double quotes\" and \'single quotes\'.',
  'one',
  '{ "property1": 123, "property2": "te\\"s\\\\t", "property3": "te\'st" }'
);
