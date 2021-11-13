# AWS boto3

This extension allows you to use code auto-complete and type checking for all [boto3](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html) services.

![boto3.typed](https://raw.githubusercontent.com/vemel/mypy_boto3_builder/master/logo.png)

## Requirements

- [Pylance](https://marketplace.visualstudio.com/items?itemName=ms-python.vscode-pylance)
  for better auto-complete support
- Set `python.analysis.typeCheckingMode` setting to `basic` to verify types with `Pylance` (optional)

## Features

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

## TODO

- [ ] Add `Quickstart command`
- [ ] Auto-populate `boto3` services instead of hardcoding

## Release Notes

### 0.1.0

Initial release.
