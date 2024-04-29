-- Delete any old records
DELETE FROM test where id!=-1;

-- Insert a new record using given values
INSERT INTO $testTable (
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
  $fDecimal,
  $fInt,
  $fBit,
  $fFloat,
  $fReal,
  $fDate,
  $fDatetime,
  $fDatetime2,
  $fTime,
  $fChar,
  $fVarchar,
  $fNchar,
  $fNvarchar,
  $fVarbinary,
  $fUniqueidentifier,
  $fNvarcharJson
);
