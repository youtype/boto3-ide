import { window } from 'vscode';
import { showProgress, getServicePackages, PypiPackageItem } from "../utils";
import { getOrInstallBoto3Version } from '../boto3';
import { resetPythonPath } from '../pythonPath';
import modifyPackages from "../modifyPackages";

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

export default async function handle(): Promise<void> {
    resetPythonPath();
    showProgress("AWS boto3", async progress => {
        const boto3Version = await getOrInstallBoto3Version(progress);
        if (!boto3Version) { return; }

        const quickPick = window.createQuickPick<PypiPackageItem>();
        quickPick.placeholder = 'Select boto3 services';
        quickPick.canSelectMany = true;
        quickPick.busy = true;
        quickPick.show();
        progress.report({ message: "Please select boto3 services you need..." });

        const servicePackages = await getServicePackages();
        await modifyPackages(servicePackages, progress, boto3Version);
    });
}