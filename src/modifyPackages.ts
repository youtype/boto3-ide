import { getServicePackages, PypiPackageItem } from "./utils";
import { window, Progress } from "vscode";

import { installPackage, uninstallPackage } from './pip';
import { PypiPackage } from "./pypi";

function getSuccessMessage(selected: readonly PypiPackageItem[]) {
    if (!selected.length) {
        return 'Boto3 code auto-complete and type checking disabled!';
    }
    const labels = selected.map(x => x.pypiPackage.getShortLabel());
    if (selected.length === 1) {
        return `Support enabled for ${labels[0]} service.`;
    }
    if (selected.length < 7) {
        const lastLabel = labels.pop();
        return `Support enabled for ${labels.join(', ')}, and ${lastLabel} services.`;
    }

    const lastLabels = labels.splice(5);
    return `Support enabled for ${labels.join(', ')}, and ${lastLabels.length} more services.`;
}

export default async function modifyPackages(servicePackages: PypiPackage[], progress: Progress<unknown>, boto3Version: string) {
    const quickPick = window.createQuickPick<PypiPackageItem>();
    quickPick.placeholder = 'Select boto3 services';
    quickPick.canSelectMany = true;
    quickPick.busy = true;
    quickPick.show();
    progress.report({ message: "Please select boto3 services you need..." });

    const pickedServicePackages = servicePackages.filter(x => x.installed || x.recommended);

    quickPick.items = servicePackages.map(x => new PypiPackageItem(x, pickedServicePackages.includes(x)));
    quickPick.selectedItems = quickPick.items.filter(x => x.picked);
    quickPick.busy = false;

    const selectedItems: readonly PypiPackageItem[] | null = await new Promise(resolve => {
        quickPick.onDidHide(() => {
            resolve(null);
            quickPick.dispose();
        });
        quickPick.onDidAccept(async () => {
            const result = quickPick.selectedItems;
            resolve(result);
            quickPick.dispose();
        });
    });

    if (!selectedItems) { return; }

    const itemsToInstall = quickPick.selectedItems.filter(x => !x.pypiPackage.installed);
    const itemsToUninstall = (
        quickPick.items
            .filter(x => !quickPick.selectedItems.includes(x))
            .filter(x => x.pypiPackage.installed)
    );
    for (const item of itemsToInstall) {
        progress.report({ message: `Adding ${item.label}...` });
        await installPackage(item.pypiPackage.moduleName, boto3Version);
    }
    for (const item of itemsToUninstall) {
        progress.report({ message: `Removing ${item.label}...` });
        await uninstallPackage(item.pypiPackage.moduleName);
    }
    window.showInformationMessage(getSuccessMessage(quickPick.selectedItems));
}