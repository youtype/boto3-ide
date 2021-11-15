import { getServicePackages } from "../utils";
import { getOrInstallBoto3Version } from '../boto3';
import modifyPackages from "../modifyPackages";


export default async function handle(): Promise<void> {
    const boto3Version = await getOrInstallBoto3Version();
    if (!boto3Version) { return; }

    const servicePackages = await getServicePackages();
    await modifyPackages(servicePackages, boto3Version);
}