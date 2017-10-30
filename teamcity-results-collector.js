/* eslint-disable class-methods-use-this */
const tsm = require('teamcity-service-messages');

class TeamCityCollector {
  testStarted(test) {
    tsm.testStarted(test);
  }
  testFinished(test) {
    tsm.testFinished(test);
  }
  testFailed(test) {
    tsm.testFailed(test);
  }
  testSuiteStarted(testSuite) {
    tsm.testSuiteStarted(testSuite);
  }
  testSuiteFinished(testSuite) {
    tsm.testSuiteFinished(testSuite);
  }
  buildStatisticValue(sample) {
    tsm.buildStatisticValue(sample);
  }
  inspectionType(inspectionType) {
    tsm.inspectionType(inspectionType);
  }
  inspection(typeId, message, file, line, severity) {
    tsm.inspection({
      typeId, message, file, line, SEVERITY: severity,
    });
  }
  buildProblem(description, identity) {
    tsm.buildProblem({ description, identity });
  }
}

module.exports = TeamCityCollector;
