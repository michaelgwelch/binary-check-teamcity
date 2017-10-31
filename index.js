#! /usr/bin/env node
/* eslint-disable no-await-in-loop, no-console */
const unirest = require('unirest');
const parseArgs = require('minimist');
const lfs = require('lfs-check');
const _ = require('lodash');
const TeamCityCollector = require('./teamcity-results-collector');
const DefaultCollector = require('./default-results-collector');

const binaryFileInspection = {
  id: 'FILE001',
  name: 'no-binary-files',
  category: 'File metadata checks',
  description: 'Reports binary files that were detected in a commit. Binary files should be tracked using git lfs rather than being checked directly into a repo.',
};

// curl -v -H "Authorization: token 2f1c1ac179d575159bb19ccf3f646dab1b87c951" https://github.jci.com/api/v3/repos/g4-metasys-server/evolution/pulls/70/commits

// argument to get branch from team city `-- %teamcity.build.branch%` in format 99/merge

// Expect to be called:
// --owner  The org or user
// --user    alias for owner
// --repo   the name of the repository
// --host   the host (defaults to github.jci.com)
// --team-city-branch  The name of the branch used by team city to do merges (format XXX/merge).
//                  If the branch is not in that format then we'll just do a check on HEAD of branch
//                  Else we'll extract pr # and call GitHub api to request commits for pr.

// [{"key":"Authorization","value":"Bearer 2f1c1ac179d575159bb19ccf3f646dab1b87c951"}]

const apiPath = 'api/v3';

async function httpGet(url, headers) {
  return new Promise(resolve => unirest('GET', url, headers, response => resolve(response)));
}

async function commitsForPullRequest(host, owner, repo, pr) {
  const headers = { Authorization: 'token 2f1c1ac179d575159bb19ccf3f646dab1b87c951' };
  const url = `https://${host}/${apiPath}/repos/${owner}/${repo}/pulls/${pr}/commits`;

  const response = await httpGet(url, headers);
  if (response.error) {
    throw new Error(response.error);
  }
  return _.map(response.body, 'sha');
}

async function checkCommits(commits) {
  const tovisit = commits;
  let binaries = [];

  do {
    const sha = tovisit.pop();

    const errors = await lfs.checkCommit(sha);

    if (errors.length > 0) {
      binaries = binaries.concat(errors);
    }
  } while (tovisit.length > 0);

  return binaries;
}

async function doCheck(host, owner, repo, branch, reporter) {
  const pr = (branch.endsWith('/merge')) ? branch.split('/')[0] : undefined;
  let binaries;
  if (pr) {
    binaries = await commitsForPullRequest(host, owner, repo, pr)
      .then(commits => checkCommits(commits))
      .catch(reason => console.log(reason));
  } else {
    binaries = await lfs.checkCommit(branch).catch(reason => console.log(reason));
  }

  if (binaries.length > 0) {
    const collector = (reporter === 'teamcity') ? new TeamCityCollector() : new DefaultCollector();
    collector.inspectionType(binaryFileInspection);

    binaries.forEach((binary) => {
      const [sha, file] = binary.split(':');
      collector.inspection('FILE001', `Binary file '${file}' detected in commit '${sha}'`, file, undefined, 'ERROR');
    });

    collector.setParameter({ name: 'binary-file-errors', value: true });
  }
}

const defaultHost = 'github.jci.com';
const args = parseArgs(process.argv.slice(2));


/* eslint-disable no-shadow */
function validArgs(args) {
  const {
    owner, repo, branch,
  } = args;


  if (!branch || !owner || !repo) {
    return false;
  }

  return true;
}
/* eslint-enable no-shardow */

if (!validArgs(args)) {
  console.log(`
  Usage: binary-check [--host=<host>] --owner=<owner|user> 
                       --repo=<repo> --branch=<branch>
  
  Notes: 
    - branch should be in the format provided by teamcity (eg. 90/merge, 
      1/merge, 100/merge)
    - host defaults to github.jci.com
    `);

  process.exit(-1);
}

const {
  host, owner, repo, branch,
} = args;

doCheck(host || defaultHost, owner, repo, branch, 'teamcity');

