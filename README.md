# AWS boto3

[VSCode](https://code.visualstudio.com/) extension to enable code completion and type checking for all [boto3](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html) services.

Supports [pip](https://pypi.org/project/pip/), [poetry](https://python-poetry.org/) and [pipenv](https://pypi.org/project/pipenv/) installers.

Add type checking for all `boto3` services with [pyright](https://github.com/microsoft/pyright) and [mypy](http://mypy-lang.org/).

![boto3.typed](https://raw.githubusercontent.com/youtype/mypy_boto3_builder/main/logo.png)

- [AWS boto3](#aws-boto3)
  - [TLDR](#tldr)
    - [Quick Start](#quick-start)
    - [Auto-discover services](#auto-discover-services)
    - [Add or remove services](#add-or-remove-services)
    - [Update services](#update-services)
    - [Browse documentation](#browse-documentation)
    - [Select installer](#select-installer)
  - [Requirements](#requirements)
  - [1.0.0 roadmap](#100-roadmap)
  - [Known issues](#known-issues)
  - [Release Notes](#release-notes)

## TLDR

Install the extension and run `AWS boto3: Quick Start`.

### Quick Start

Setup code completion and type checking in a new project.

### Auto-discover services

Find services you might need based on your project source code.

### Add or remove services

Start using this extension with this command.
It enables type checking and code completion for different `boto3` services.
You can enable all services or only ones that are used in the current project.

### Update services

Check for updates with this command.
Optionally updates `boto3`/`botocore`.

### Browse documentation

Select any installed service to see all generated types for easier type checking.

### Select installer

Allows to choose between `poetry`, `pipenv` and `pip` install methods.

## Requirements

- [Pylance](https://marketplace.visualstudio.com/items?itemName=ms-python.vscode-pylance)
  for better code completion support
- Set `python.analysis.typeCheckingMode` setting to `basic` to verify types with `Pylance` (optional)

## 1.0.0 roadmap

- Support `conda`
- Open settings to help activate `pylance` and type checking

## Known issues

> Installation fails if `poetry`/`pipenv` uses non-public PyPI as a source.

Use `pip` installer instead.

> Extension commands can be blocked by non-active Python extension.

I am working on it.

## Release Notes

Full release notes can be found in [CHANGELOG](./CHANGELOG.md).
