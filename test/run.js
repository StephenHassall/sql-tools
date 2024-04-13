/**
 * Run all the tests.
 */
import Test from "./test.js";
import TestSqlTemplate from "./testSqlTemplate.js";

(async () => {
    // Perform tests
    await TestSqlTemplate.run();

    // Report results
    Test.report();
})();