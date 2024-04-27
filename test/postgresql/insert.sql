-- Delete any old records
DELETE FROM test;

-- Insert a new record using given values
INSERT INTO $testTable (
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
  $fBoolean,
  $fInteger,
  $fDecimal,
  $fDate,
  $fTime,
  $fTimestamp,
  $fChar,
  $fVarchar,
  $fText,
  $fBytea,
  $fEnum,
  $fJson,
  $fArray1,
  $fArray2,
  $fUuuid
);
