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
  inspectionType() {}
  inspection(inspection) {
    console.log(JSON.stringify(inspection, null, 2));
  }
  buildProblem() {}
}

module.exports = DefaultResultsCollector;
