# Sql Template Condition

This is used to process if different preprocessor blocks in the SQL template should be used or not.
Below is information about how this is done.

```sql
#if <condition>
  SELECT * FROM table1;
#elif <condition>
  SELECT * FROM table2;
#endif
```

## Tokens

The condition text is split into different types of tokens.

|Type|Information|
|---|---|
|`IDENTIFIER`|One of the values the format process uses. It must start with a `$` character. For example, `$age`, `$searchDate`.|
|`DATABASE_TYPE`|The name of a database type constant. For example `MYSQL`, `POSTGRESQL`.|
|`NUMBER`|A number literal value or a hexadecimal value. For example, `42`, `3.142`, `0xA3`.|
|`TEXT`|A text literal value. This can start with a single or double quotation mark. Some escape characters can be used to. For example, `'Peter O\'Tool`.|
|`MULTIPLE`|The multiple `*` character.|
|`DIVIDE`|The divide `/` character (forward slash).|
|`ADD`|The addition `+` character.|
|`SUBTRACT`|The subtraction `-` character.|
|`OPEN_BRACKET`|The open bracket `(` character.|
|`CLOSE_BRACKET`|The closed bracket `)` character.|
|`COMPARE_EQUAL`|The compare equal characters. Can be either `=`, `==` or `===`.|
|`COMPARE_NOT_EQUAL`|The compare not equal characters. Can be either `!=`, `!==` or `<>`.|
|`COMPARE_LESS`|The compare less than `<` character.|
|`COMPARE_GREATER`|The compare greater than `>` character.|
|`COMPARE_LESS_EQUAL`|The compare less than or equal to `<=` character.|
|`COMPARE_GREATER_EQUAL`|The compare greater than or equal to `>=` character.|
|`TRUE`|The true constant value `true`, `TRUE`.|
|`FALSE`|The false constant value `false`, `FALSE`.|
|`NULL`|The NULL constant value `null`, `NULL`.|
|`AND`|The **AND** condition `&&` or `AND`.|
|`OR`|The **OR** condition `\|\|` or `OR`.|

## Nodes

The tokens are placed in an order of nodes that make up the structure of the condition. Below is the format of the nodes.

`BOOL_EXPRESSION`

```mermaid
flowchart LR;
    BE[Bool Expression] --> RE1[Relation Expression] --> P1(((-))) --> AND & OR --> RE2[Relation Expression] --> END
    RE2[Relation Expression] --> P1
    P1 --> END
```

`RELATION_EXPRESSION`

```mermaid
flowchart LR;
    RE[Relation Expression] --> OB["("] --> BE[Bool Expression] --> CB[")"] --> END
    RE[Relation Expression] --> TRUE --> END
    RE[Relation Expression] --> FALSE --> END
    RE[Relation Expression] --> IDENTIFIER --> END
    RE[Relation Expression] --> NOT1["NOT"] --> IDENTIFIER --> END
    RE[Relation Expression] --> DATABASE_TYPE --> END
    RE[Relation Expression] --> NOT2["NOT"] --> DATABASE_TYPE --> END
    RE[Relation Expression] --> E1[Expression] --> COMPARE --> E2[Expression] --> END
```

`EXPRESSION`

```mermaid
flowchart LR;
    EXP[Expression] --> S1["-"] --> TERM1[Term] --> P1(((-))) --> ADD["+"] & S2["-"] --> TERM2[Term] --> END
    EXP[Expression] --> TERM1[Term]
    TERM2 --> P1
```

`TERM`

```mermaid
flowchart LR;
    TERM[Term] --> FACTOR1[Factor] --> P1(((-))) --> MUL["*"] & DIV["/"] --> FACTOR2[Factor] --> END
    FACTOR2[Factor] --> P1
```

`FACTOR`

```mermaid
flowchart LR;
    Factor --> TEXT --> END
    Factor --> NUMBER --> END
    Factor --> NULL --> END
    Factor --> TRUE --> END
    Factor --> FALSE --> END
    Factor --> IDENTIFIER --> END
```

