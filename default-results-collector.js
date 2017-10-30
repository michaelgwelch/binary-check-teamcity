/* eslint-disable no-console, class-methods-use-this */
class DefaultResultsCollector {
  testStarted() {}
  testFinished() {}
  testFailed(test) {
    console.log(test.message);
  }
  testSuiteStarted() {}
  testSuiteFinished() {}
  buildStatisticValue() {}
}

module.exports = DefaultResultsCollector;
