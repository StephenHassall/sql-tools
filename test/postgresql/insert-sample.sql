-- Delete any old records
DELETE FROM test;

-- Insert a new example record using different SQL values
INSERT INTO "test" (
  f_boolean,
  f_integer,
  f_decimal,
  f_date,
  f_time,
  f_timestamp,
  f_char,
  f_varchar,
  f_text,
  f_bytea,
  f_enum,
  f_json,
  f_array1,
  f_array2,
  f_uuid
)
VALUES (
  TRUE,
  123,
  12.3456,
  '2024-04-19',
  '12:34:56',
  '2024-04-20 12:34:56.123',
  'abc',
  E'this is a string with escape codes \b\f\n\r\t\"\'\\',
  E'this is more text with\"double quotes\" and \'single quotes\'.',
  '\xF0E1D2C3B4A5968778695A4B3C2D1E0F',
  'one',
  E'{ "property1": 123, "property2": "te\\"s\\\\t", "property3": "te\'st" }',
  E'{123, 456, 789}',
  E'{{"test1.1", "test1.2"},{"test2.1", "test2.2"}}',
  E'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
);
