import { ExtensionContext, window, QuickPickItem } from 'vscode';
import { BaseInstaller } from '../installers/base';
import { createSmartInstaller } from '../installers/smart';

export class InstallerItem implements QuickPickItem {
    label: string;
    picked: boolean;

    constructor(public installer: BaseInstaller, picked: boolean) {
        this.label = installer.name;
        this.picked = picked;
    }
}

export default async function handle(context: ExtensionContext): Promise<BaseInstaller | void> {
    const smartInstaller = await createSmartInstaller(context);
    const installers = smartInstaller.getInstallers();
    return await smartInstaller.selectInstaller(installers);
}