import { getServicePackages, PypiPackageItem } from "../utils";
import { window, env, Uri } from "vscode";

export default async function handle(): Promise<void> {
    const quickPick = window.createQuickPick<PypiPackageItem>();
    quickPick.placeholder = 'Documentation will be opened in a browser';
    quickPick.busy = true;
    quickPick.show();

    const servicePackages = await getServicePackages();

    let pickedServicePackages = servicePackages.filter(x => x.installed);
    if (!pickedServicePackages.length) {
        pickedServicePackages = servicePackages.slice(0, 5);
    }
    quickPick.items = pickedServicePackages.map(x => new PypiPackageItem(x, false));
    quickPick.busy = false;

    const selectedItem: PypiPackageItem | null = await new Promise(resolve => {
        quickPick.onDidHide(() => {
            resolve(null);
            quickPick.dispose();
        });
        quickPick.onDidAccept(async () => {
            const result = quickPick.selectedItems[0];
            resolve(result);
            quickPick.dispose();
        });
    });

    if (!selectedItem) { return; }
    env.openExternal(Uri.parse(selectedItem.pypiPackage.getDocsURL()));
}