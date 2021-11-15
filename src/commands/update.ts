import { getServicePackages } from "../utils";
import { getOrInstallBoto3Version, updateBoto3Version } from '../boto3';
import { getLatestBoto3Version } from '../pypi';
import { createSmartInstaller } from '../installers/smart';

export default async function handle(): Promise<void> {
    let boto3Version = await getOrInstallBoto3Version();
    if (!boto3Version) { return; }

    const latestBoto3Version = await getLatestBoto3Version();
    if (latestBoto3Version !== boto3Version) {
        boto3Version = await updateBoto3Version(latestBoto3Version) || boto3Version;
    }

    const servicePackages = await getServicePackages();
    const installedPackages = servicePackages.filter(x => x.installed);
    if (!installedPackages.length) { return; }

    const smartInstaller = await createSmartInstaller();
    await smartInstaller.installPackages(installedPackages, [], boto3Version, true);
}