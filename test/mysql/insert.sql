-- Set database to use
USE sql_tools_test;

-- Delete any old records
DELETE FROM test where id!=-1;

-- Insert a new record using given values
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
  $fBool,
  $fInt,
  $fDecimal,
  $fDate,
  $fTime,
  $fDatetime,
  $fDatetimeMillisecond,
  $fTimestamp,
  $fYear,
  $fChar,
  $fVarchar,
  $fBlob,
  $fText,
  $fEnum,
  $fJson
);
