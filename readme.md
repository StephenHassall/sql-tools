# SQL Tools

```javascript

//const sqlOptions = new SqlOptions();
SqlOptions.default.databaseType = DatabaseType.MYSQL;

//const sqlTemplate = await SqlTemplateFile.getTemplate('./search.sql', sqlOptions);
const sqlTemplate = await SqlTemplateFile.getTemplate('./search.sql');

const values = {};
values.filterByAge = 18;
values.filterByName = 'bob';
values.orderBy = 'name';
values.orderDirection = 'up';

const sql = sqlTemplate.format(values);

```

```sql
SELECT
  *
FROM
  table

-- Set search filter
WHERE

--if $filterByName
  name LIKE CONCAT("%", $filterByName, "%") AND
--end

--if $filterByAge
  age>=$filterByAge AND
--endif

  IS NOT NULL id

-- Set order
ORDER BY

--if $orderBy="name"
  field_name
--elif $orderBy="date"
  field_date
--endif

--if $orderDirection="up"
  ASC
--else
  DESC
--endif

-- Set paging
LIMIT
  $page*$itemsPerPage,
  $something?;
```

```sql
-- Not like this
name LIKE '%$filderByName%'

-- Do this instead
name LIKE CONCAT('%', $filderByName, '%');
```

```javascript
const values = {};
values.bulkInsertList = [
  [ 12, 'hello' ],
  [ 23, 'world' ]
];
```

```sql
INSERT INTO table (field1, field2)
VALUES
  $bulkInsertList;

-- INSERT INTO table (field1, field2)
-- (12, 'hello'),
-- (23, 'world');
```
