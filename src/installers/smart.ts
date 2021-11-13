import * as poetry from './poetry';
import * as pip from './pip';
import { PypiPackage } from '../pypi';
import { Progress } from 'vscode';

async function installWithPoetry(packages: PypiPackage[], removePackages: PypiPackage[], version: string, progress: Progress<unknown>) {
    const masterPackage = packages.find(x => !x.getExtraName().length);
    const extraPackages = packages.filter(x => x.getExtraName());
    if (masterPackage) {
        progress.report({ message: `Installing ${extraPackages.length} services with Poetry...` });
        const extras = extraPackages.map(x => x.getExtraName());
        await poetry.installPackage(masterPackage.moduleName, version, extras, true);
        return;
    }

    for (const extraPackage of extraPackages) {
        progress.report({ message: `Installing ${extraPackage.getLabel()} service with Poetry...` });
        await poetry.installPackage(extraPackage.moduleName, `<=${version}`, [], true);
    }
    for (const removePackage of removePackages) {
        progress.report({ message: `Removing ${removePackage.getLabel()} service with Poetry...` });
        await poetry.removePackage(removePackage.moduleName);
    }
}

async function installWithPip(installPackages: PypiPackage[], removePackages: PypiPackage[], version: string, progress: Progress<unknown>) {
    const masterPackage = installPackages.find(x => !x.getExtraName().length);
    const extraPackages = installPackages.filter(x => x.getExtraName());
    if (masterPackage) {
        progress.report({ message: `Installing ${extraPackages.length} services...` });
        const extrasNames = extraPackages.map(x => x.getExtraName());
        await pip.installPackage(masterPackage.moduleName, version, extrasNames);
    } else {
        for (const extraPackage of extraPackages) {
            progress.report({ message: `Installing ${extraPackage.getLabel()}...` });
            await pip.installPackage(extraPackage.moduleName, version);
        };
    }
    for (const removePackage of removePackages) {
        progress.report({ message: `Removing ${removePackage.getLabel()}...` });
        await pip.uninstallPackage(removePackage.moduleName);
    };
}

export async function install(installPackages: PypiPackage[], removePackages: PypiPackage[], version: string, progress: Progress<unknown>) {
    if (poetry.isPresent()) {
        console.log('Found poetry, using it for installation');
        return await installWithPoetry(installPackages, removePackages, version, progress);
    }

    console.log('Using pip for installation');
    return await installWithPip(installPackages, removePackages, version, progress);
}