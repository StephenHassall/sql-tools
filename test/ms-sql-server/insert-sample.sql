-- Delete any old records
DELETE FROM test where id!=-1;

-- Insert a new example record using different SQL values
INSERT INTO [test] (
  f_decimal,
  f_int,
  f_bit,
  f_float,
  f_real,
  f_date,
  f_datetime,
  f_datetime2,
  f_time,
  f_char,
  f_varchar,
  f_nchar,
  f_nvarchar,
  f_varbinary,
  f_uniqueidentifier,
  f_nvarchar_json
)
VALUES (
  12.3456,
  123,
  1,
  123.45,
  678.91,
  '2022-11-01',
  '2023-03-19 01:23:45.987',
  '2024-04-20 12:34:56.123',
  '12:34:56',
  'abc',
  'this is a string with escape code '' single quotation mark',
  N'XYZ',
  N'this is a unicode string with escape code '' single quotation mark',
  0xF0E1D2C3B4A5968778695A4B3C2D1E0F,
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  N'{ "property1": 123, "property2": "te\"s\\t", "property3": "te''st" }'
);
