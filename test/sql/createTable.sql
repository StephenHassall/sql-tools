-- PostgreSql create test table
CREATE TABLE test (
	f_integer INTEGER,
	f_numeric DECIMAL(10, 4),
	f_string VARCHAR(200),
	f_date DATE,
	f_time TIME,
	f_datetime TIMESTAMP,
	f_bytea BYTEA,
	f_array_text TEXT[][],
	f_array_integer INTEGER[],
	f_json JSON
);

-- PostgreSql insert test record
INSERT INTO test (
	f_integer,
	f_numeric,
	f_string,
	f_date,
	f_time,
	f_datetime,
	f_bytea,
	f_array_text,
	f_array_integer,
	f_json
)
VALUES (
	123,
	12.3456,
	'this is a string',
	'2024-04-19',
	'12:34:56',
	'2024-04-19 12:34:56',
	'\x01AF',
	'{{"test1.1", "test1.2"}, {"test2.1", "test2.2"}}',
	'{123, 456, 678, 901}',
	'{ "property1": 123, "property2": "test" }'
);