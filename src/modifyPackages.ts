import { pluralize, PypiPackageItem } from './utils';
import { ExtensionContext, window } from "vscode";

import { createSmartInstaller } from './installers/smart';
import { PypiPackage } from './pypi';
import { NAME } from './constants';

function getSuccessMessage(selected: readonly PypiPackageItem[]) {
    if (!selected.length) {
        return `${NAME} disabled!`;
    }
    const servicePackages = selected.filter(x => !x.pypiPackage.isMaster);
    return `${NAME} enabled for ${pluralize(servicePackages.length, 'service')}.`;
}

export default async function modifyPackages(servicePackages: PypiPackage[], context: ExtensionContext, boto3Version: string) {
    const quickPick = window.createQuickPick<PypiPackageItem>();
    quickPick.placeholder = 'Select boto3 services...';
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
    const smartInstaller = await createSmartInstaller(context);
    const result = await smartInstaller.installPackages(selectedPackages, removePackages, boto3Version, true);
    if (result) {
        await window.showInformationMessage(getSuccessMessage(selectedItems));
    }
}