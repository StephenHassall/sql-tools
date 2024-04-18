/**
 * Run all the tests.
 */
import Test from "./test.js";
import TestSqlTemplate from "./test-sql-template.js";
import TestSqlTemplateCondition from "./test-sql-template-condition.js";
import TestSqlTemplateFile from "./test-sql-template-file.js";

(async () => {
    // Perform tests
    await TestSqlTemplate.run();
    //await TestSqlTemplateFile.run();
    //TestSqlTemplateCondition.run();

    // Report results
    Test.report();
})();