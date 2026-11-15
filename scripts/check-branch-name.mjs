import { execFileSync } from "node:child_process";

const branchName =
  process.argv[2] ??
  execFileSync("git", ["branch", "--show-current"], {
    encoding: "utf8",
  }).trim();

const allowedBranchName =
  /^(?!chore\/[1-9]\d*-lighthouse-(?:propose|implement)-)(feat|fix|docs|refactor|test|chore|build|ci|perf|revert)\/[1-9]\d*-[a-z0-9]+(?:-[a-z0-9]+)*$/;

const dependencyBranchName =
  /^dependabot\/(?:npm_and_yarn|github_actions)\/[a-zA-Z0-9][a-zA-Z0-9._-]*(?:\/[a-zA-Z0-9][a-zA-Z0-9._-]*)*$/;

const lighthouseBranchName = /^lighthouse\/(?:propose|implement)-[1-9]\d*-[a-f0-9]{12}$/;
const lighthouseWorkBranchName = /^chore\/[1-9]\d*-lighthouse-(?:propose|implement)-[a-f0-9]{12}$/;

if (!lighthouseBranchName.test(branchName) && !lighthouseWorkBranchName.test(branchName)
    && !allowedBranchName.test(branchName) && !dependencyBranchName.test(branchName)) {
  console.error(
    `Invalid branch name: ${branchName || "(detached HEAD)"}. Use <type>/<issue-number>-<kebab-case-slug>, for example feat/47-export-report, or a supported automation branch.`,
  );
  process.exitCode = 1;
}
