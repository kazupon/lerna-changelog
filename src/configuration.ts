const fs = require('fs')
const path = require('path')
const hostedGitInfo = require('hosted-git-info')
import execa from 'execa'

import ConfigurationError from './configuration-error'

export interface Configuration {
  repo: string
  rootPath: string
  labels: { [key: string]: string }
  ignoreCommitters: string[]
  cacheDir?: string
  nextVersion: string | undefined
  nextVersionFromMetadata?: boolean
  package?: string
}

export interface ConfigLoaderOptions {
  nextVersionFromMetadata?: boolean
}

export async function load(
  options: ConfigLoaderOptions = {}
): Promise<Configuration> {
  const cwd = process.cwd()
  const { stdout: rootPath } = await execa(
    'git',
    ['rev-parse', '--show-toplevel'],
    {
      cwd
    }
  )
  return Promise.resolve(fromPath(rootPath, options))
}

export function fromPath(
  rootPath: string,
  options: ConfigLoaderOptions = {}
): Configuration {
  // Step 1: load partial config from `package.json` or `lerna.json`
  const config = fromPackageConfig(rootPath) || fromLernaConfig(rootPath) || {}

  // Step 2: fill partial config with defaults
  let { repo, nextVersion, labels, cacheDir, ignoreCommitters } = config // eslint-disable-line prefer-const

  if (!repo) {
    repo = findRepo(rootPath)
    if (!repo) {
      throw new ConfigurationError(
        'Could not infer "repo" from the "package.json" file.'
      )
    }
  }

  if (options.nextVersionFromMetadata || config.nextVersionFromMetadata) {
    nextVersion = findNextVersion(rootPath)

    if (!nextVersion) {
      throw new ConfigurationError(
        'Could not infer "nextVersion" from the "package.json" file.'
      )
    }
  }

  if (!labels) {
    labels = {
      breaking: ':boom: Breaking Change',
      enhancement: ':rocket: Enhancement',
      bug: ':bug: Bug Fix',
      documentation: ':memo: Documentation',
      internal: ':house: Internal'
    }
  }

  if (!ignoreCommitters) {
    ignoreCommitters = [
      'dependabot-bot',
      'dependabot[bot]',
      'greenkeeperio-bot',
      'greenkeeper[bot]',
      'renovate-bot',
      'renovate[bot]'
    ]
  }

  return {
    repo,
    nextVersion,
    rootPath,
    labels,
    ignoreCommitters,
    cacheDir
  }
}

function fromLernaConfig(rootPath: string): Partial<Configuration> | undefined {
  const lernaPath = path.join(rootPath, 'lerna.json')
  if (fs.existsSync(lernaPath)) {
    return JSON.parse(fs.readFileSync(lernaPath)).changelog
  }
}

function fromPackageConfig(
  rootPath: string
): Partial<Configuration> | undefined {
  const pkgPath = path.join(rootPath, 'package.json')
  if (fs.existsSync(pkgPath)) {
    return JSON.parse(fs.readFileSync(pkgPath)).changelog
  }
}

function findRepo(rootPath: string): string | undefined {
  const pkgPath = path.join(rootPath, 'package.json')
  if (!fs.existsSync(pkgPath)) {
    return
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath))
  if (!pkg.repository) {
    return
  }

  return findRepoFromPkg(pkg)
}

function findNextVersion(rootPath: string): string | undefined {
  const pkgPath = path.join(rootPath, 'package.json')
  const lernaPath = path.join(rootPath, 'lerna.json')

  const pkg = fs.existsSync(pkgPath) ? JSON.parse(fs.readFileSync(pkgPath)) : {}
  const lerna = fs.existsSync(lernaPath)
    ? JSON.parse(fs.readFileSync(lernaPath))
    : {}

  return pkg.version
    ? `v${pkg.version}`
    : lerna.version
    ? `v${lerna.version}`
    : undefined
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export function findRepoFromPkg(pkg: any): string | undefined {
  const url = pkg.repository.url || pkg.repository
  const info = hostedGitInfo.fromUrl(url)
  if (info && info.type === 'github') {
    return `${info.user}/${info.project}`
  }
}
