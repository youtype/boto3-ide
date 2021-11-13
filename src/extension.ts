import * as vscode from 'vscode';
import updateHandler from './commands/update';
import modifyHandler from './commands/modify';
import docsHandler from './commands/docs';
import autodiscoverHandler from './commands/autodiscover';
import quickstartHandler from './commands/quickstart';

export async function activate(context: vscode.ExtensionContext) {
	console.log('boto3-ide is now active!');

	context.subscriptions.push(
		vscode.commands.registerCommand('boto3-ide.quickstart', quickstartHandler)
	);
	context.subscriptions.push(
		vscode.commands.registerCommand('boto3-ide.modify', modifyHandler)
	);
	context.subscriptions.push(
		vscode.commands.registerCommand('boto3-ide.update', updateHandler)
	);
	context.subscriptions.push(
		vscode.commands.registerCommand('boto3-ide.docs', docsHandler)
	);
	context.subscriptions.push(
		vscode.commands.registerCommand('boto3-ide.autodiscover', autodiscoverHandler)
	);
}

export function deactivate() { }
