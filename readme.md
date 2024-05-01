# SQL Tools

A collection of useful tools to help you work with SQL.

> **IMPORTANT:** This is an ESM only package.

**Supported Databases:**
- `MySQL`
- `PostgreSQL`
- `Microsoft SQL Server`
- `Oracle`

Want another database? Reach out and sponsor me to develop it.

## Installation

```
npm install @coderundebug/SqlTools
```

## Contents

- [Introduction](#introduction)
- [How to format a SQL template file](#how-to-format-a-sql-template-file)
- [SqlTemplateFile](#sqltemplatefile)
- [SqlTemplate](#sqltemplate)
- [SqlConfig](#sqlconfig)
- [SqlConvert](#sqlconvert)
- [Limitations](#limitations)

## Introduction

Each database library has its own method of taking SQL commands and adding input values. Some use `?` characters and an array of values. These tools will allow you to do the same sort of thing but for any database, using `$` markers to place values, and handle preprocessor sections.

In the below example we are loading a template SQL file, formatting it with some values, which in the end will give us the final SQL command we can use with a database.

```javascript
// Load in SQL template file
const sqlTemplate = await SqlTemplateFile.getTemplate('insert.sql');

// Format template with values
const sql = sqlTemplate.format({ name: 'Stephen', age: 25 });

// Use SQL command to insert the record
```

The insert.sql file would be formatted as follows.

```sql
-- Insert record into user table
INSERT INTO user (name, age) VALUES ($name, $age);
```

The `$name` and `$age` parts will be replaced by the values with the same name. The name of the value has the dollar `$` character placed in front of it when used inside the SQL template. After formatting the end result would look like this.

```sql
-- Insert record into user table
INSERT INTO user (name, age) VALUES ('Stephen', 25);
```

You will notice that the name was a string and is therefore formatted using single quotation marks. The values are converted into text and then their `$` markers are replaced with it. This type of formatting depends on the values type and the database you want the SQL to be formatted for.

Preprocessing is a method of including and excluding blocks of SQL depending on the values you are using. The example below lists the users, searching either by the user’s name or age.

```sql
-- List users
SELECT
  name,
  age
FROM
  user
WHERE
--if $searchByAge
  age=$searchByAge;
--else
  name=$searchByName;
--endif
```

This uses the preprocessor statement `--if $searchByAge` which checks to see if the value is used. If it is then the search by age part is used, but if not then the `--else` part is used instead.

```javascript
// Load in SQL template file
const sqlTemplate = await SqlTemplateFile.getTemplate('list.sql');

// Format template with values
const sql = sqlTemplate.format({ searchByAge: 25 });

// Use SQL command to list records with the same age
```

The final SQL command that can be used, will look like this below.

```sql
-- List users
SELECT
  name,
  age
FROM
  user
WHERE
  age=25;
```

The preprocess comments have been processed, with the ones required being kept, and all the others being removed. The preprocess conditions are looked at in more detail later on below.

## How to format a SQL template file

We have taken a quick look at formatting a SQL template. Here we will look at it in more detail. There are two parts, converting `$values` into SQL text, and preprocessor conditions.

The **SqlTemplate** `format` function takes an object that contains a number of different values. These are converted into SQL text and inserted into the SQL template.

```javascript
// Create values object and add data
const values = {};
values.fBoolean = true;
values.fText = 'Hello World';
values.fInteger = 1234;
values.fDecimal = 3.142;
values.fDateTime = new Date(Date.UTC(2024, 3, 27, 11, 15, 45));

// Format template with values
const sql = sqlTemplate.format(values);
```

```sql
SELECT $fBoolean, $fText, $fInteger, $fDecimal, $fDateTime;
```

The output of the formatting process will depend on the database type you have configured. It would look something like this.

```sql
-- MySQL
SELECT TRUE, 'Hello World', 1234, 3.142, '2024-04-27 11:15:45';
```

```sql
-- PostgreSQL
SELECT TRUE, E'Hello World', 1234, 3.142, '2024-04-27 11:15:45';
```

```sql
-- Microsoft SQL Server
SELECT 1, N'Hello World', 1234, 3.142, '2024-04-27 11:15:45';
```

Different database types output the values in slightly different ways.

It can handle different value data types. Below is a list.

|Data Type|Information|
|---|---|
|undefined|Will always output the text "NULL".|
|null|Will always output the text "NULL".|
|Number|Converts the number into a string without any extra formatting.|
|Boolean|Converts the boolean value as either TRUE or FALSE, or where needed 1 or 0.|
|String|Checks and replaces any escape characters. Will stop any SQL injection strings.|
|Date|Will convert the date into YYYY-MM-DD HH-MM-SS format and if there are any millisecond parts this will also be added to the end.|
|Buffer|Converts into a hexadecimal string.|
|Array|Writes the array data into a list of parts.|
|toSql|If the function toSql is available then it is called and its return string will be used.|
|SqlIdentifier|Class that can be used to output identifiers (table and field names).|
|SqlTrusted|Class that is used to output plain text without it being checked first.|
|SqlJson|Class that is used to output JSON data.|
|SqlNonUnicode|Class used to output non-unicode text data. This is only needed in Microsoft SQL server when dealing with character fields that are non-unicode.|
|SqlTimestamp|Class used for Oracle timestamps.|

```javascript
// Create values object and add data
const values = {};
values.fBuffer = Buffer.from([0x00, 0x11, 0x22, 0x33]);
values.fArray = [123, 456, 789];
values.tableIdentifier = new SqlIdentifier('test');
values.fJson = new SqlJson(someObject);
values.trusted = new SqlTrusted('@test_id');

// Format template with values
const sql = sqlTemplate.format(values);
```

```sql
INSERT INTO $tableIdentifier (fields...)
VALUES (
  $fBuffer,
  $fArray,
  $fJson
);
SET $thrusted=LAST_INSERT_ID();
```

The outputted SQL text would end up looking something like this.

```sql
INSERT INTO `test` (fields...)
VALUES (
  X'00112233',
  '{123, 456, 789}',
  '{ "property1": "hello", "property2": "world" }'
);
SET @test_id=LAST_INSERT_ID();
```

Another useful feature is to include and exclude different parts of the SQL template depending on the values. This uses preprocessor markers with conditions.

```sql
--if <condition>
SELECT * FROM table1;
--elif <condition>
SELECT * FROM table2;
--else
SELECT * FROM table3;
--endif
```

The preprocessor markers are `--if`, `--elif` (else if), `--else` and `--endif`. You can also use `#if`, `#elif`, `#else` and `#endif`. The conditions are used to control which parts of the preprocessor sections end up in the final SQL.

Here are some examples of the type of conditions you can have.

|Example|Description|
|---|---|
|$fNumber = 10|If the fNumber value is 10.|
|$fBoolean = TRUE|If the fBoolean value is true.|
|$fText != "Hello World"|If the fText value is not equal to “Hello World”.|
|$fDateTime >= "2024-01-01"|If the fDateTime is greater or equal to the given date.|
|$first = true AND $second = false|If the first is true and the second is false.|
|$a = 1 && ($b = 2 \|\| $c = 3)|If a value is 1 and either b is 2 or c is 3.|

The list of possible conditions are as follows.

|Condition|Information|
|---|---|
|`=`, `==`, `===`|Equal. You can use either a single = character value or 2, or even 3. They all do the same thing.|
|`!=`, `!==`,`<>`|Not equal to. Both do the same thing.|
|`>`|Greater than.|
|`<`|Less than.|
|`>=`|Greater than or equal to.|
|`<=`|Less than or equal to.|

You can combine conditions together using the `AND`, `&&` operations or the `OR`, `||` ones. It is done to look either like an SQL condition or a JavaScript condition, but either way they do the same thing.

You can use some calculations too but there are some limitations here.

|Examples|
|---|
|$first * 2 > $second + 10|
|$first / 4 <= $second - 42|
|$first >= $second * $third|

You need to be careful when comparing dates. The date value will contain the date and time parts, but you can compare only the date section if you want.

|Example|Information|
|---|---|
|$fDateTime = "2024-04-27 11:23:45"|Both the date and the time need to match.|
|$fDateTime = "2024-04-27"|Only the date needs to match. The time part can be anything.|
|$fDateTime <= "2024-04-27"|If the date is the same or less then it passes the condition. Because only the date part is looked at, this will pass, even though the actual date and time is greater than the date being compared.|
|$fDateTime <= "2024-04-27 00:00:00"|This time the time is also given. This means it compares not only the date but the time too. As a result, this time, it will not pass the condition.|

You can also check which database type is being used.

```sql
CREATE TABLE USER (
--if MYSQL OR POSTGRESQL
  id SERIAL PRIMARY KEY,
--elif MS_SQL_SERVER
  id BIGINT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
--else
  ID INTEGER GENERATED ALWAYS AS IDENTITY,
--endif
);
```

## SqlTemplateFile

This is used to load SQL template files and create a new SqlTemplate object. These are *.sql files with template formatting within.

**getTemplate**(*file*, *[importMetaUrl]*, *[sqlConfig]*, *[cache]*)

***Description***

This static function is used to load in a SQL template file, convert it into a SqlTemplate object and return a promise that resolves to it.

***Arguments***
- **file** - This is either the full file path or a relative file location.
- **importMetaUrl** *(optional)* - If you want to use relative file locations then this is the path of the module the file will be relative to.
- **sqlConfig** *(optional)* - Configuration information relating to the SQL file being loaded. If not used then the default values are used. This is used to control the database type and whether to use UTC with dates, plus some other settings.
- **cache** *(optional)* - Controls if the `SqlTemplate` object is cached in memory. If it is and the same file is requested again, then instead of loading the SQL file and creating the `SqlTemplate` object, it just reuses the same one it created before. The default is true and - caching is always used if not set otherwise.

***Examples***

```javascript
// Load in SQL template file that is in a "sql" subfolder
const sqlTemplate1 = await SqlTemplateFile.getTemplate('./sub/insert.sql', import.meta.url);

// Create PostgreSQL config
const postgresqlConfig = new SqlConfig();
postgresqlConfig.databaseType = DatabaseType.POSTGRESQL;

// Load in SQL template file for PostgreSQL database
const sqlTemplate2 = await SqlTemplateFile.getTemplate('/pg/select.sql', null, postgresqlConfig);
```

**getTemplateByName**(*name*, *file*, *[importMetaUrl]*, *[sqlConfig]*, *[cache]*)

***Description***

This static function is just like `getTemplate` but it looks inside the SQL file for the template section. Instead of the whole file being a single template, you can put multiple SQL templates inside a single file. This is done by using `--template [name]` and `--endtemplate` markers.

***Arguments***

- **name** - The name of the template to look for within the file.
- **file** - This is either the full file path or a relative file location.
- **importMetaUrl** *(optional)* - If you want to use relative file locations then this is the path of the module the file will be relative to.
- **sqlConfig** *(optional)* - Configuration information relating to the SQL file being loaded. If not used then the default values are used. This is used to control the database type and whether to use UTC with dates, plus some other settings.
- **cache** *(optional)* - Controls if the `SqlTemplate` object is cached in memory. If it is and the same file and name is requested again, then instead of loading the SQL file and creating the `SqlTemplate` object, it just reuses the same one it created before. The default is true and caching is always used if not set otherwise.

***Example***

```sql
-- Collection of templates
--template list
SELECT * FROM table;
--endtemplate

--template insert
INSERT INTO table (name, age) VALUES ($name, $age);
--endtemplate
```

```javascript
// Load in SQL template from within file
const sqlTemplate = await SqlTemplateFile.getTemplateByName(
	'insert',
'./sub/collection.sql',
import.meta.url);
```

## SqlTemplate

The SQL template class contains the template information and is used to format it, with a given set of values, to create a final SQL which you would use with your database.

Normally you would get one of these objects by calling one of the SqlTemplateFile static functions, but you can create one supplying your own SQL template text.

**constructor**(*template*, *[sqlConfig]*)

***Description***

The constructor of the `SqlTemplate` class object. When creating your own instance of the class you pass the template text and the configuration object (if required).

***Arguments***

- **template** - String containing the SQL template text.
- **sqlConfig** *(optional)* - Configuration information relating to the SQL template. If not used then the default values are used. This is used to control the database type and whether to use UTC with dates, plus some other settings.

***Example***

```javascript
// Set template text
const template = 'INSERT INTO table (name, age) VALUES ($name, &age);'

// Create SQL template using the template
const sqlTemplate = new SqlTemplate(template);

// Create SQL command
const sql = sqlTemplate.format({ name: 'Stephen', age: 42 });
```

**format**(*values*, *[sqlConfig]*)

***Description***

Uses the SQL template information the object was created with, along with the values given to it, and creates the final SQL text. This performs all the preprocessor steps, and inserts all the `$values`. You can use the same SQL template with different values to get different final SQL text.

***Arguments***

- **values** - An object containing all the properties with their values that will be converted into safe SQL text, and inserted into the final SQL text.
- **sqlConfig** *(optional)* - Configuration information relating to the SQL template. If not used then the one that was given when the object was created will be used.

***Example***

```javascript
// Set template text
const template = 'INSERT INTO table (name, age) VALUES ($name, &age);'

// Create SQL template using the template
const sqlTemplate = new SqlTemplate(template);

// Create SQL commands
const sql1 = sqlTemplate.format({ name: 'Stephen', age: 42 });
const sql2 = sqlTemplate.format({ name: 'Paul', age: 31 });
const sql3 = sqlTemplate.format({ name: 'Sue', age: 58 });
```

## SqlConfig

There are a number of configuration settings that can be used to change the SQL text created. There are default values, which can be changed, making all templates output SQL to that configuration, but you can create `SqlTemplate` objects with their own configuration. This would allow you to have one group of templates for MySql and another group for PostgreSQL.

**sqlConfig.default**

**Description**

Global default SqlConfig object. If no sqlConfig object is passed to any of the template or format functions, then this default will be used. You can change these default settings at the start of your application and all SqlTool functions will use them by default.

***Example***

```javascript
// Start of application
SqlConfig.default.databaseType = DatabaseType.POSTGRESQL;
SqlConfig.default.utc = true;
SqlConfig.removeComments = false;
SqlConfig.singleLine = false;

// Load in SQL template file (will default to PostgreSQL)
const sqlTemplate1 = await SqlTemplateFile.getTemplate('./sql/select.sql');
```

**databaseType**

***Description***

Gets and sets the database type. This can be either `MYSQL`, `POSTGRESQL`, `MS_SQL_SERVER` (Microsoft SQL Server) or `Oracle`.

**utc**

***Description***

Gets and sets whether to use UTC when outputting date and time text. If set to false, then it will use the local date and time values of the date object. The results of this will depend on the time zone the application is running on. By default this is set to true, so that it will always use the UTC part of the date when converting it into text.

**removeComments**

***Description***

Gets and sets if the comments are to be removed when formatting the SQL template. Comments are the parts that do nothing but can help to give extra information about when is happening. These are the parts the start with `/*` and end with `*/`. Other comment types are the ones that start with the `--` characters (or the `#` character) and stop at the end of the line. By default the comments are not removed.

**singleLine**

***Description***

Gets and sets if all the SQL text will be put onto a single line of text. All the new line characters will be removed and the final SQL text will be trimmed. This will also remove any comments too. By default this is not set.

***Example***

```javascript
// Create PostgreSQL and MySQL configs
const postgreSqlConfig = new SqlConfig();
postgreSqlConfig.databaseType = DatabaseType.POSTGRESQL;
const mySqlConfig = new SqlConfig();
mySqlConfig.databaseType = DatabaseType.MYSQL;

// Load in SQL template file (will defaults)
const sqlTemplate = await SqlTemplateFile.getTemplate('./sql/select.sql');

// Format SQL for postgreSQL and MySQL
const sqlPostgreSql = sqlTemplate.format(values, postgreSqlConfig);
const sqlMySql = sqlTemplate.format(values, mySqlConfig);
```

## SqlConvert

If you want to manually convert values into SQL safe text, without using a template, then you can use this class and its many static functions. Normally you would not need to use this class but it may be useful for you to convert values into SQL yourself.

**valueToSql**(*value*, *[sqlConfig]*)

***Description***

Converts the value, which can be of any known or unknown type, into safe SQL text.

***Arguments***

- **value** - The value that you want to convert into safe SQL text.
- **sqlConfig** *(optional)* - Configuration information which will help workout how to convert the value. If not set then the default configuration is used.

***Example***

```javascript
// Convert the values into safe SQL
const sqlInteger = SqlConvert.valueToSql(123);
const sqlDate = SqlConvert.valueToSql(new Date(Date.UTC(2024, 4, 1, 11, 43, 32)));
const sqlText = SqlConvert.valueToSql('Hello world');

// sqlInteger = 123
// sqlDate = '2024-05-01 11:43:32'
// sqlText = 'Hello world'
```

**booleanToSql**(*value*, *[sqlConfig]*)

***Description***

Converts the boolean value into safe SQL text. Some databases will output TRUE or FALSE, but some will use 1 and 0 instead.

***Arguments***

- **value** - The boolean value that you want to convert into safe SQL text.
- **sqlConfig** *(optional)* - Configuration information which will help workout how to convert the value. If not set then the default configuration is used.

***Example***

```javascript
// Convert boolean value in safe SQL
const sqlBoolean = SqlConvert.valueToSql(true);
// sqlBoolean = TRUE
```

**dateToSql**(*value*, *[sqlConfig]*)

***Description***

Converts the date value into safe SQL text. This should be a Date object.

***Arguments***

- **value** - The date value that you want to convert into safe SQL text.
- **sqlConfig** *(optional)* - Configuration information which will help workout how to convert the value. If not set then the default configuration is used.

***Example***

```javascript
// Convert date value in safe SQL
const sqlDate = SqlConvert.dateToSql(new Date(Date.UTC(2024, 4, 1, 11, 43, 32));
// sqlDate = '2024-05-01 11:43:32'
```

**stringToSql**(*value*, *[sqlConfig]*)

***Description***

Converts the string value into safe SQL text.

***Arguments***

- **value** - The string value that you want to convert into safe SQL text.
- **sqlConfig** *(optional)* - Configuration information which will help workout how to convert the value. If not set then the default configuration is used.

***Example***

```javascript
// Convert string value in safe SQL
const sqlString = SqlConvert.stringToSql("Hello 'small' world");
// sqlString = 'Hello \'small\' world'
```

**identifierToSql**(*value*, *[sqlConfig]*)

***Description***

Converts an identifier string value into safe SQL text. An identifier is the name of a database, table, column, etc.

***Arguments***

- **value** - The identifier string value that you want to convert into safe SQL text.
- **sqlConfig** *(optional)* - Configuration information which will help workout how to convert the value. If not set then the default configuration is used.

***Example***

```javascript
// Convert identifier value in safe SQL
const sqlIdentifier = SqlConvert.identifierToSql('testTable');
// sqlIdentifier = [testTable]
```

**bufferToSql**(*buffer*, *[sqlConfig]*)

***Description***

Converts a buffer into safe SQL text. This will be binary data normally in some type of hexadecimal format.

***Arguments***

- **buffer** - The buffer data that you want to convert into safe SQL text.
- **sqlConfig** *(optional)* - Configuration information which will help workout how to convert the value. If not set then the default configuration is used.

***Example***

```javascript
// Convert buffer in safe SQL
const sqlBuffer = SqlConvert.bufferToSql(Buffer.from([0x1F, 0x2E]));
// sqlBuffer = X'1F2E'
```

**arrayToSql**(*array*, *[sqlConfig]*)

***Description***

Converts an array into safe SQL text. This is only used with PostgreSQL databases. However, you can convert arrays of values into strings. You should only use arrays of the same type. It can only use numbers, string, dates and booleans. Any other data type will create an error.

***Arguments***

- **array** - The array that you want to convert into safe SQL text.
- **sqlConfig** *(optional)* - Configuration information which will help workout how to convert the value. If not set then the default configuration is used.

***Example***

```javascript
// Convert array in safe SQL
const sqlArray = SqlConvert.arrayToSql([123, 456, 789]);
// sqlArray = '{123, 456, 789}'
```

**jsonToSql**(*object*, *[sqlConfig]*)

***Description***

Converts any object into JSON safe SQL text.

***Arguments***

- **object** - The object you want to convert into JSON safe SQL text.
- **sqlConfig** *(optional)* - Configuration information which will help workout how to convert the value. If not set then the default configuration is used.

***Example***

```javascript
// Convert object in JSON safe SQL
const sqlJson = SqlConvert.jsonToSql({ name: "Stephen", age: 34 });
// sqlJson = '{"name": "Stephen", "age": 34}'
```

## Limitations

There are some limitations that you may need to know about.

***SqlTemplateFile cache and SqlConfig***

If you load a `SqlTemplate` from a file and set the `SqlConfig` at the same time, then load the same `SqlTemplate` file but with a different `SqlConfig`, then because it is being obtained from the cache, the new `SqlConfig` is not used, instead the first one will still be used.

Loading the same `SqlTemplate` from a file with different SqlConfigs will not work. The only way around this is to load the `SqlTemplate` from a file and set the cache parameter to false.

***Oracle Date***

By default the `Date` object is always converted into date only SQL, with no time parts used. If you want to output time then you will need to use a `SqlTimestamp` class object.

***Oracle Database and SqlConfig***

When using Oracle you need to remove all the comments and put everything on to a single line. This can be done by setting `SqlConfig`. Take a look at the Oracle testing section for ideas on how to interact with the database.


