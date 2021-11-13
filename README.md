# AWS boto3


[VSCode](https://code.visualstudio.com/) extension to enable code auto-complete and type checking for all [boto3](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html) services.

![boto3.typed](https://raw.githubusercontent.com/vemel/mypy_boto3_builder/master/logo.png)

- [AWS boto3](#aws-boto3)
  - [TLDR](#tldr)
  - [Features](#features)
    - [Quick Start](#quick-start)
    - [Add or remove services](#add-or-remove-services)
    - [Update services](#update-services)
    - [Auto-discover services](#auto-discover-services)
    - [Browse documentation](#browse-documentation)
  - [Requirements](#requirements)
  - [TODO](#todo)
  - [Release Notes](#release-notes)
    - [0.1.0](#010)

## TLDR

Install the extension and run `AWS boto3: Quick Start`.

## Features

### Quick Start

Setup code auto-complete and type checking in a new project.

### Add or remove services

Start using this extension with this command.
It enables type checking and auto-complete for different `boto3` services.
You can enable all services or only ones that are used in the current project.

### Update services

Check for updates with this command.
Optionally updates `boto3`/`botocore`.

### Auto-discover services

Find services you might need based on your project source code.

### Browse documentation

Select any installed service to see all generated types for easier type checking.

## Requirements

- [Pylance](https://marketplace.visualstudio.com/items?itemName=ms-python.vscode-pylance)
  for better auto-complete support
- Set `python.analysis.typeCheckingMode` setting to `basic` to verify types with `Pylance` (optional)

## TODO

- [ ] Auto-populate `boto3` services instead of hardcoding
- [ ] Support `poetry`
- [ ] Support `pipenv`

## Release Notes

### 0.1.0

Initial release.
