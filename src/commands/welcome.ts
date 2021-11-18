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
    console.log('silenced', silenced);
    if (silenced) { return; }
    const initialized = context.workspaceState.get(SETTING_INITIALIZED);
    console.log('initialized', initialized);
    if (initialized) { return; }

    const pipPackages = await getPackages(context);
    const pipPackageNames = pipPackages.map(x => x.name);
    console.log(pipPackageNames);

    if (!pipPackageNames.includes('boto3')) { console.log('boto3 not installed'); return; }
    if (pipPackageNames.includes('boto3-stubs')) { console.log('boto3-stubs installed'); return; }

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
    if (response === `Install ${NAME}`) {
        await quickstartHandler(context);
    }
    if (response === 'Maybe later') {
        await window.showInformationMessage(
            `Run AWS boto3: Quick Start command anytime to enable ${NAME}.`
        );
    }
}