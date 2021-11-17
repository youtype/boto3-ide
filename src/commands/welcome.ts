import { ExtensionContext, window } from 'vscode';
import { NAME, INITIALIZED } from '../constants';
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
    const initialized = context.workspaceState.get(INITIALIZED);
    if (initialized) { return; }

    const pipPackages = await getPackages(context);
    const pipPackageNames = pipPackages.map(x => x.name);

    if (!pipPackageNames.includes('boto3')) { return; }
    if (pipPackageNames.includes('boto3-stubs')) { return; }
    const response = await window.showInformationMessage(
        `This project uses boto3 with no ${NAME}.`,
        `Install ${NAME}`,
        'Maybe later'
    );
    context.workspaceState.update(INITIALIZED, 'true');
    if (response === 'Install it now') {
        await quickstartHandler(context);
    }
    if (response === 'Maybe later') {
        await window.showInformationMessage(
            `Run AWS boto3: Quick Start command anytime to enable ${NAME}.`
        );
    }
}