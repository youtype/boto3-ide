import { ExtensionContext, commands } from 'vscode';
import updateHandler from './commands/update';
import modifyHandler from './commands/modify';
import docsHandler from './commands/docs';
import autodiscoverHandler from './commands/autodiscover';
import quickstartHandler from './commands/quickstart';
import installerHandler from './commands/installer';
import { createSmartInstaller } from './installers/smart';

export async function activate(context: ExtensionContext) {
    console.log('boto3-ide is now active!');

    context.subscriptions.push(
        commands.registerCommand('boto3-ide.quickstart', async () => {
            return await quickstartHandler(context);
        })
    );
    context.subscriptions.push(
        commands.registerCommand('boto3-ide.modify', async () => {
            return await modifyHandler(context);
        })
    );
    context.subscriptions.push(
        commands.registerCommand('boto3-ide.update', async () => {
            return await updateHandler(context);
        })
    );
    context.subscriptions.push(
        commands.registerCommand('boto3-ide.docs', async () => {
            return await docsHandler(context);
        })
    );
    context.subscriptions.push(
        commands.registerCommand('boto3-ide.autodiscover', async () => {
            return await autodiscoverHandler(context);
        })
    );
    context.subscriptions.push(
        commands.registerCommand('boto3-ide.installer', async () => {
            return await installerHandler(context);
        })
    );

    // await hello(context);
}

async function hello(context: ExtensionContext): Promise<void> {
    const initialized = context.workspaceState.get("initialized");
    console.log("initialized", initialized);
    if (!initialized) {
        context.workspaceState.update("initialized", "true");
        const smartInstaller = await createSmartInstaller(context);
        if (await smartInstaller.getBoto3Version()) {
            await quickstartHandler(context);
        }
    }
}

export function deactivate() { }
