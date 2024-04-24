/**
 * Run all the tests.
 */
import Test from "./test.js";
import TestSqlConvert from "./test-sql-convert.js";
import TestSqlTemplate from "./test-sql-template.js";
import TestSqlTemplateCondition from "./test-sql-template-condition.js";
import TestSqlTemplateFile from "./test-sql-template-file.js";
import TestMySql from "./mysql/test-mysql.js";
import TestPostgreSql from "./postgresql/test-postgresql.js";

(async () => {
    // Perform tests
    //TestSqlConvert.run();
    //await TestSqlTemplate.run();
    //await TestSqlTemplateFile.run();
    //TestSqlTemplateCondition.run();
    //await TestMySql.run();
    await TestPostgreSql.run();

    // Report results
    Test.report();
})();