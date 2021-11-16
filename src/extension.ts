import { ExtensionContext, commands } from 'vscode';
import updateHandler from './commands/update';
import modifyHandler from './commands/modify';
import docsHandler from './commands/docs';
import autodiscoverHandler from './commands/autodiscover';
import quickstartHandler from './commands/quickstart';
import { createSmartInstaller } from './installers/smart';

export async function activate(context: ExtensionContext) {
    console.log('boto3-ide is now active!');

    context.subscriptions.push(
        commands.registerCommand('boto3-ide.quickstart', quickstartHandler)
    );
    context.subscriptions.push(
        commands.registerCommand('boto3-ide.modify', modifyHandler)
    );
    context.subscriptions.push(
        commands.registerCommand('boto3-ide.update', updateHandler)
    );
    context.subscriptions.push(
        commands.registerCommand('boto3-ide.docs', docsHandler)
    );
    context.subscriptions.push(
        commands.registerCommand('boto3-ide.autodiscover', autodiscoverHandler)
    );

    // await hello(context);
}

async function hello(context: ExtensionContext): Promise<void> {
    const initialized = context.workspaceState.get("initialized");
    console.log("initialized", initialized);
    if (!initialized) {
        context.workspaceState.update("initialized", "true");
        const smartInstaller = await createSmartInstaller();
        if (await smartInstaller.getBoto3Version()) {
            await quickstartHandler();
        }
    }
}

export function deactivate() { }
