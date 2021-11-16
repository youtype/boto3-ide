import { PypiPackageItem } from "./utils";
import { window } from "vscode";

import { createSmartInstaller } from './installers/smart';
import { PypiPackage } from "./pypi";

function getSuccessMessage(selected: readonly PypiPackageItem[]) {
    if (!selected.length) {
        return 'Boto3 IntelliSense and type checking disabled!';
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

export default async function modifyPackages(servicePackages: PypiPackage[], boto3Version: string) {
    const quickPick = window.createQuickPick<PypiPackageItem>();
    quickPick.placeholder = 'Select boto3 services';
    quickPick.canSelectMany = true;
    quickPick.busy = true;
    quickPick.show();

    const pickedServicePackages = servicePackages.filter(x => x.installed || x.recommended);

    quickPick.items = servicePackages.map(x => new PypiPackageItem(x, pickedServicePackages.includes(x)));
    quickPick.selectedItems = quickPick.items.filter(x => x.picked);
    quickPick.busy = false;

    const selectedItems: PypiPackageItem[] | null = await new Promise(resolve => {
        quickPick.onDidHide(() => {
            resolve(null);
            quickPick.dispose();
        });
        quickPick.onDidAccept(async () => {
            const result = quickPick.selectedItems;
            resolve([...result]);
            quickPick.dispose();
        });
    });

    if (!selectedItems) { return; }

    const selectedPackages = selectedItems.map(x => x.pypiPackage);
    const removePackages = servicePackages.filter(x => x.installed).filter(x => !selectedPackages.includes(x));
    const smartInstaller = await createSmartInstaller();
    await smartInstaller.installPackages(selectedPackages, removePackages, boto3Version, true);
    window.showInformationMessage(getSuccessMessage(selectedItems));
}