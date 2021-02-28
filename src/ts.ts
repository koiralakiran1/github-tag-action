export type Await<T> = T extends {
  then(onfulfilled?: (value: infer U) => unknown): unknown;
}
  ? U
  : T;

export type Nullable<T> = null | T;

export type ConventionalCommit = {
  hash: string;
  header: string;
  type: string;
  scope: string;
  subject: string;
  body: Nullable<string>;
  footer: string;
  notes: Array<{ title: string, text: string }>;
  references: Array<{
      action: string;
      owner: Nullable<string>;
      repository: Nullable<string>;
      issue: string;
      raw: string;
  }>;
  revert: boolean;
  shortHash?: string;
};

export type ConventionalChangelogContext = {
  version: string;
  title: string;
  isPatch: boolean;
  host: string;
  owner: string;
  repository: string;
  repoUrl: string;
};

export type CustomReleaseRule = {
  section?: string; // Section in changelog to group commit. eg: 'Bug Fix', 'Features' etc
  type: string; // commit type. eg: feat, fix etc.
  release: string; // release type. eg: 'major', 'minor' etc.
}
