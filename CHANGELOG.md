# Change Log

All notable changes to the `boto3-ide` extension will be documented in this file.

## [Unreleased]

## [0.5.2]
### Fixed
- Updated packages to the latest version
- Updated dependencies

## [0.5.1]
### Fixed
- Updated packages to the latest version
- Updated dependencies

## [0.5.0]
### Added
- Support for multiple directories in a workspace'
- Update supported `boto3` services list, now includes 299 services

### Changed
- `poetry`/`pipenv` can discover lock files from any workspace directory. The first directory with a lockfile is used as a `cwd`
- All workspace directories are scanned to discover `boto3` services in-use

### Fixed
- Error on gitignored files outside of a project root

## [0.4.2]
### Fixed
- Auto-discover respects `.gitignore`
- `.venv` folder is scanned if it is not gitignored
- `pipenv`/`poetry` were not discovered properly in Python path sometimes
- Error if `pip` is not available

## [0.4.1]
### Fixed
- Error on non-readable file in the workspace

## [0.4.0]
### Added
- Quick Start suggestion in a new workspace if `boto3` is in use

### Changed
- If there are no packages to update, `Auto-discover` is suggested
- Update command shows notification when update is complete
- Installer selection got extra info and `(selected)` mark
- Selected installer is shown on top

### Fixed
- Pluralized services/packages in notifications

## [0.3.0]
### Added
- New `Select installer` command

### Changed
- Added progress while waiting for Python extension to be active
- `poetryPath`/`pipenvPath` now has the highest priority before searching in Python path
- Selected installer is saved per workspace

### Fixed
- Added missing service packages
- Improved service list update script
- Skip duplicate Python paths when trying to find installers
- Success message is no longer shown if installation has been interrupted by user

## [0.2.1]
### Fixed
- Get pythonPath from `Python` VSCode extension API
- `poetry` and `pipenv` can be found outside of current python
- Removed useless progress bars
- Installed `boto3` sometimes could not be discovered
- Faster project source scanning
- Support older VSCode releases

## [0.2.0]
### Added
- `pipenv` support

### Changed
- Packages are installed with `poetry` if they have been installed with it previously
- Installer allows to choose between `poetry` and `pip` if `poetry` is not used yet for installation

### Fixed
- `poetry` correctly removes master module if it is not needed
- Services autodiscovery did not check all folders

## [0.1.0]
- Initial release
