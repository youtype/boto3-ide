import { getServicePackages } from "../utils";
import { getOrInstallBoto3Version } from '../boto3';
import { getLatestBoto3Version } from '../pypi';
import { createSmartInstaller } from '../installers/smart';
import { ExtensionContext, window } from 'vscode';

export default async function handle(context: ExtensionContext): Promise<void> {
    let boto3Version = await getOrInstallBoto3Version(context);
    if (!boto3Version) { return; }

    const latestBoto3Version = await getLatestBoto3Version();
    if (latestBoto3Version !== boto3Version) {
        const smartInstaller = await createSmartInstaller(context);
        const action = await window.showInformationMessage(
            `New boto3 version ${latestBoto3Version} available!`,
            `Update with ${smartInstaller.getInstallers().map(x => x.name).join(' / ')}`,
        );
        if (!action) { return; }

        await smartInstaller.install("boto3", latestBoto3Version, false);
        boto3Version = latestBoto3Version;
    }

    const servicePackages = await getServicePackages(context);
    const installedPackages = servicePackages.filter(x => x.installed);
    if (!installedPackages.length) { return; }

    const smartInstaller = await createSmartInstaller(context);
    await smartInstaller.installPackages(installedPackages, [], boto3Version, true);
}