import { showProgress, getServicePackages } from "../utils";
import { getOrInstallBoto3Version } from '../boto3';
import modifyPackages from "../modifyPackages";
import SourceScanner from "../sourceScanner";
import { PypiPackage } from "../pypi";

export default async function handle(): Promise<void> {
    const boto3Version = await getOrInstallBoto3Version();
    if (!boto3Version) { return; }
    const sourceScanner = new SourceScanner();

    let servicePackages: PypiPackage[] = [];
    await showProgress(
        'Scanning workspace...',
        async progress => {
            const files = await sourceScanner.findPythonFiles();
            const serviceNamesSet: Set<string> = new Set();

            progress.report({ message: `Scanning ${files.length} files...` });
            for (const file of files) {
                const services = await sourceScanner.findServices(file);
                services.forEach(x => serviceNamesSet.add(x));
            }

            progress.report({ message: `Checking installed packages...` });
            const serviceNames = [...serviceNamesSet];
            servicePackages = await getServicePackages(serviceNames);
        }
    );
    await modifyPackages(servicePackages, boto3Version);
}