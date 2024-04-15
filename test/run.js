/**
 * Run all the tests.
 */
import Test from "./test.js";
import TestSqlTemplate from "./testSqlTemplate.js";
import TestSqlTemplateCondition from "./testSqlTemplateCondition.js";

(async () => {
    // Perform tests
    //await TestSqlTemplate.run();
    TestSqlTemplateCondition.run();

    // Report results
    Test.report();
})();