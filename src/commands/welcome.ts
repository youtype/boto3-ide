import { ExtensionContext, window } from 'vscode';
import { NAME, SETTING_INITIALIZED, SETTING_SILENCED } from '../constants';
import PipPackage from '../installers/pipPackage';
import { createSmartInstaller } from '../installers/smart';
import quickstartHandler from './quickstart';

async function getPackages(context: ExtensionContext): Promise<PipPackage[]> {
    try {
        const smartInstaller = await createSmartInstaller(context);
        return await smartInstaller.listPackages();
    } catch {
        return [];
    }
}

export default async function handle(context: ExtensionContext): Promise<void> {
    const silenced = context.globalState.get(SETTING_SILENCED);
    if (silenced) { return; }
    const initialized = context.workspaceState.get(SETTING_INITIALIZED);
    if (initialized) { return; }

    const pipPackages = await getPackages(context);
    const pipPackageNames = pipPackages.map(x => x.name);

    if (!pipPackageNames.includes('boto3')) { return; }
    if (pipPackageNames.includes('boto3-stubs')) { return; }
    const response = await window.showInformationMessage(
        `This project uses boto3 with no ${NAME}.`,
        `Install ${NAME}`,
        'Maybe later',
        'Do not show this again'
    );
    context.workspaceState.update(SETTING_INITIALIZED, 'true');
    if (response === 'Do not show this again') {
        context.globalState.update(SETTING_SILENCED, 'true');
    }
    if (response === 'Install it now') {
        await quickstartHandler(context);
    }
    if (response === 'Maybe later') {
        await window.showInformationMessage(
            `Run AWS boto3: Quick Start command anytime to enable ${NAME}.`
        );
    }
}