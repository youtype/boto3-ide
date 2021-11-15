# Change Log

All notable changes to the "boto3-ide" extension will be documented in this file.

## [0.2.1]
### Fixed
- Get pythonPath from `Python` VSCode extension API
- `poetry` and `pipenv` can be found outside of current python
- Removed useless progress bars
- Installed `boto3` sometimes could not be discovered
- Faster project source scanning

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