// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import updateHandler from './commands/update';
import modifyServicesHandler from './commands/modify';
import { getPythonPath } from './utils';

export async function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "boto3-ide" is now active!');

	context.subscriptions.push(
		vscode.commands.registerCommand('boto3-ide.modify', modifyServicesHandler)
	);
	context.subscriptions.push(
		vscode.commands.registerCommand('boto3-ide.update', updateHandler)
	);
}

// this method is called when your extension is deactivated
export function deactivate() {}
