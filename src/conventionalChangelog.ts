import * as core from '@actions/core';

import type {
  ConventionalChangelogContext,
  ConventionalCommit,
  CustomReleaseRule,
} from './ts';

const typeToDefaultSectionMap = Object.freeze({
  feat: 'Features',
  fix: 'Bug Fixes',
  perf: 'Performance Improvements',
  revert: 'Reverts',
  docs: 'Documentation',
  style: 'Styles',
  refactor: 'Code Refactoring',
  test: 'Tests',
  build: 'Build Systems',
  ci: 'Continuous Integration',
});

/**
 * Most of the code for `transform` function were copied from `conventional-changelog-angular`:
 * https://github.com/conventional-changelog/conventional-changelog/blob/master/packages/conventional-changelog-angular/writer-opts.js
 *
 * Extended `conventional-changelog-angular` to allow custom changelog sections with `custom_rules`.
 * @param customReleaseRules
 */
export function getCustomTransformForWriterOpts(
  customReleaseRules: CustomReleaseRule[] = []
) {
  const rulesMap: Record<string, CustomReleaseRule> = customReleaseRules.reduce(
    (result, rule) => {
      return {
        ...result,
        [rule.type]: {
          ...rule,
        },
      };
    },
    {}
  );

  const transform = (
    commit: ConventionalCommit,
    context: ConventionalChangelogContext
  ) => {
    let discard = true;
    const issues: string[] = [];
    core.debug('Inside transform function >>> ' + commit.subject + ' >>> ' + commit.header);

    commit.notes.forEach((note) => {
      note.title = 'BREAKING CHANGES';
      discard = false;
    });

    if (commit.revert) {
      commit.type = typeToDefaultSectionMap.revert;
    } else if (discard) {
      return;
    } else {
      commit.type =
        rulesMap[commit.type as keyof typeof rulesMap]?.section ||
        typeToDefaultSectionMap[commit.type as keyof typeof typeToDefaultSectionMap] ||
        'Miscellaneous';
    }

    if (commit.scope === '*') {
      commit.scope = '';
    }

    if (typeof commit.hash === 'string') {
      commit.shortHash = commit.hash.substring(0, 7);
    }

    if (typeof commit.subject === 'string') {
      let url = context.repository
        ? `${context.host}/${context.owner}/${context.repository}`
        : context.repoUrl;
      if (url) {
        url = `${url}/issues/`;
        // Issue URLs.
        commit.subject = commit.subject.replace(/#([0-9]+)/g, (_, issue) => {
          issues.push(issue);
          return `[#${issue}](${url}${issue})`;
        });
      }
      if (context.host) {
        // User URLs.
        commit.subject = commit.subject.replace(
          /\B@([a-z0-9](?:-?[a-z0-9/]){0,38})/g,
          (_, username) => {
            if (username.includes('/')) {
              return `@${username}`;
            }

            return `[@${username}](${context.host}/${username})`;
          }
        );
      }
    }

    // remove references that already appear in the subject
    commit.references = commit.references.filter((reference) => {
      if (issues.indexOf(reference.issue) === -1) {
        return true;
      }

      return false;
    });

    return commit;
  };

  return transform;
}
