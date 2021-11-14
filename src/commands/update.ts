import { showProgress, getServicePackages } from "../utils";
import SmartInstaller from '../installers/smart';
import { getOrInstallBoto3Version, updateBoto3Version } from '../boto3';
import { getLatestBoto3Version } from '../pypi';
import { resetPythonPath } from '../pythonPath';

export default async function handle(): Promise<void> {
    resetPythonPath();
    showProgress("AWS boto3", async progress => {
        let boto3Version = await getOrInstallBoto3Version(progress);
        if (!boto3Version) { return; }

        const latestBoto3Version = await getLatestBoto3Version();
        if (latestBoto3Version !== boto3Version) {
            boto3Version = await updateBoto3Version(latestBoto3Version) || boto3Version;
        }

        const servicePackages = await getServicePackages();
        const installedPackages = servicePackages.filter(x => x.installed);
        if (!installedPackages.length) { return; }

        await new SmartInstaller(progress).installPackages(installedPackages, [], boto3Version, true);
    });
}