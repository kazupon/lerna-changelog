# :scroll: lerna-changelog

[![Lint](https://github.com/kazupon/lerna-changelog/actions/workflows/lint.yml/badge.svg)](https://github.com/kazupon/lerna-changelog/actions/workflows/lint.yml)
[![Test](https://github.com/kazupon/lerna-changelog/actions/workflows/test.yml/badge.svg)](https://github.com/kazupon/lerna-changelog/actions/workflows/test.yml)

PR-based changelog generator with monorepo support

## :warning: How does it differ from Original?
- :star: Support for generating changelog for each package.
- :star: `packageMode` option of `MarkdownRenderer`
- :package: Node v12 or later support
- :package: Expose load config API

## :cd: Installation

Install with `yarn`:

```bash
yarn add @kazupon/lerna-changelog --dev
# or globally
yarn global add @kazupon/lerna-changelog
```

We're using `yarn` but you can use `npm` if you like:

```bash
npm install --save-dev @kazupon/lerna-changelog
# or globally
npm install --global @kazupon/lerna-changelog
```

## :rocket: Usage

```bash
$ lerna-changelog
```

```md
## Unreleased (2018-05-24)

#### :bug: Bug Fix
* [#198](https://github.com/my-org/my-repo/pull/198) Avoid an infinite loop ([@helpful-hacker](https://github.com/helpful-hacker))

#### :house: Internal
* [#183](https://github.com/my-org/my-repo/pull/183) Standardize error messages ([@careful-coder](https://github.com/careful-coder))

#### Commiters: 2
- Helpful Hacker ([@helpful-hacker](https://github.com/helpful-hacker))
- [@careful-coder](https://github.com/careful-coder)
```

By default `lerna-changelog` will show all pull requests that have been merged
since the latest tagged commit in the repository. That is however only true for
pull requests with certain labels applied. The labels that are supported by
default are:

- `breaking` (:boom: Breaking Change)
- `enhancement` (:rocket: Enhancement)
- `bug` (:bug: Bug Fix)
- `documentation` (:memo: Documentation)
- `internal` (:house: Internal)

You can also use the `--from` and `--to` options to view a different
range of pull requests:

```bash
lerna-changelog --from=v1.0.0 --to=v2.0.0
```

### Monorepo support

If you have a packages folder and your projects in subfolders of that folder `lerna-changelog` will detect it and include the package names in the changelog for the relevant changes.

### GitHub Token

Since `lerna-changelog` interacts with the GitHub API you may run into rate
limiting issues which can be resolved by supplying a "personal access token":

```
export GITHUB_AUTH="..."
```

You'll need a [personal access token](https://github.com/settings/tokens)
for the GitHub API with the `repo` scope for private repositories or just
`public_repo` scope for public repositories.


## Configuration

You can configure `lerna-changelog` in various ways. The easiest way is by
adding a `changelog` key to the `package.json` file of your project:

```json5
{
  // ...
  "changelog": {
    "labels": {
      "feature": "New Feature",
      "bug": "Bug Fix"
    }
  }
}
```

The supported options are:

- `repo`: Your "org/repo" on GitHub
  (automatically inferred from the `package.json` file)

- `nextVersion`: Title for unreleased commits
  (e.g. `Unreleased`)

- `labels`: GitHub PR labels mapped to changelog section headers

- `ignoreCommitters`: List of committers to ignore (exact or partial match).
  Useful for example to ignore commits from bots.

- `cacheDir`: Path to a GitHub API response cache to avoid throttling
  (e.g. `.changelog`)

- `package`: The name of the package to generate a changelog for monorepo
  (e.g. `@kazupon/lerna-changelog`)


## :copyright: License

[MIT](http://opensource.org/licenses/MIT)
