import { showProgress, getServicePackages } from "../utils";
import { installPackage } from '../pip';
import { getOrInstallBoto3Version } from '../boto3';
import { getLatestBoto3Version } from '../pypi';
import { window } from "vscode";
import { resetPythonPath } from '../pythonPath';

export default async function handle(): Promise<void> {
    resetPythonPath();
    showProgress("AWS boto3", async progress => {
        let boto3Version = await getOrInstallBoto3Version(progress);
        if (!boto3Version) { return; }

        const latestBoto3Version = await getLatestBoto3Version();
        if (latestBoto3Version !== boto3Version) {
            progress.report({ message: 'Please update boto3 or dismiss...' });
            const doInstall = await window.showInformationMessage(
                `New boto3 version ${latestBoto3Version} available!`,
                'Update now'
            );
            if (doInstall) {
                progress.report({ message: `Updating boto3 to ${latestBoto3Version}...` });
                await installPackage('boto3');
                boto3Version = latestBoto3Version;
            }
        }

        const extrasNames = (await getServicePackages()).filter(x => x.installed).filter(x => x.getExtraName()).map(x => x.getExtraName());

        progress.report({ message: `Updating ${extrasNames.length} services to ${boto3Version}...` });
        await installPackage('boto3-stubs', boto3Version, extrasNames);
        window.showInformationMessage('All services are up to date');
    });
}