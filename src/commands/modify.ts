import { getServicePackages } from "../utils";
import { getOrInstallBoto3Version } from '../boto3';
import modifyPackages from "../modifyPackages";
import { ExtensionContext } from 'vscode';


export default async function handle(context: ExtensionContext): Promise<void> {
    const boto3Version = await getOrInstallBoto3Version(context);
    if (!boto3Version) { return; }

    const servicePackages = await getServicePackages(context);
    await modifyPackages(servicePackages, context, boto3Version);
}