import { window } from 'vscode';
import { showProgress, getServicePackages, ServicePackageItem } from "../utils";
import { installPackage, uninstallPackage } from '../pip';
import { getOrInstallBoto3Version } from '../boto3';

export default async function modify(): Promise<void> {
    showProgress("AWS boto3 IDE", async progress => {
        const boto3Version = await getOrInstallBoto3Version(progress);
        if (!boto3Version) { return; }

        const quickPick = window.createQuickPick<ServicePackageItem>();
        quickPick.placeholder = 'Select boto3 services';
        quickPick.canSelectMany = true;
        quickPick.busy = true;
        quickPick.show();
        progress.report({ message: "Please select boto3 services you need..." });
    
        const servicePackages = (await getServicePackages());

        let pickedServicePackages = servicePackages.filter(x => x.installed);
        if (!pickedServicePackages.length) {
            pickedServicePackages = servicePackages.slice(0, 7);
        }

        quickPick.items = servicePackages.map(x => new ServicePackageItem(x, pickedServicePackages.includes(x)));
        quickPick.selectedItems = quickPick.items.filter(x => x.picked);
        quickPick.busy = false;

        const selectedItems: readonly ServicePackageItem[] | null = await new Promise(resolve => {
            quickPick.onDidHide(() => {
                quickPick.hide();
                resolve(null);
            });
            quickPick.onDidAccept(async () => {
                quickPick.hide();
                resolve(quickPick.selectedItems);
            });
        });

        if (!selectedItems) { return; }

        const itemsToInstall = quickPick.selectedItems.map(x => x.servicePackage).filter(x => !x.installed);
        const itemsToUninstall = (
            quickPick.items
                .filter(x => !quickPick.selectedItems.includes(x))
                .map(x => x.servicePackage)
                .filter(x => x.installed)
        );
        for (const item of itemsToInstall) {
            progress.report({ message: `Adding ${item.serviceName} service...` });
            await installPackage(item.moduleName, boto3Version);
        }
        for (const item of itemsToUninstall) {
            progress.report({ message: `Removing ${item.serviceName} service...` });
            await uninstallPackage(item.moduleName);
        }
        window.showInformationMessage('Code auto-complete and type checking for boto3 installed successfully');
    });
}