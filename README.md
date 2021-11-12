# AWS boto3 IDE

This extension allows you to use code auto-complete and type checking for all [boto3](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html) services.

## Requirements

- [Pylance](https://marketplace.visualstudio.com/items?itemName=ms-python.vscode-pylance)
  for better auto-complete support
- Set `python.analysis.typeCheckingMode` setting to `basic` to verify types with `Pylance` (optional)

## Features

### Add or remove boto3 services

Start using this extension with this command.
It enables type checking and auto-complete for different `boto3` services.
You can enable all services or only ones that are used in the current project.

### Update installed services

Check for updates with this command.
Optionally updates `boto3`/`botocore`.

## TODO

- [ ] Discover required services from project source
- [ ] Allow disabling main modules
- [ ] Auto-populate `boto3` services instead of hardcoding

## Release Notes

### 1.0.0

Initial release.