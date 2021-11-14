import PoetryInstaller from './poetry';
import PipInstaller from './pip';
import { PypiPackage } from '../pypi';
import { Progress, window } from 'vscode';
import { getPythonPath, getWorkDir } from '../pythonPath';
import PipPackage from './pipPackage';



export default class SmartInstaller {
    pythonPath: string;
    workDir: string;
    poetry: PoetryInstaller;
    pip: PipInstaller;
    installedPackages: PipPackage[];
    progress: Progress<unknown> | undefined;

    static poetryName: string = "poetry";
    static pipName: string = "pip";

    constructor(progress?: Progress<unknown>) {
        this.pythonPath = getPythonPath();
        this.workDir = getWorkDir();
        this.poetry = new PoetryInstaller(this.pythonPath, this.workDir);
        this.pip = new PipInstaller(this.pythonPath, this.workDir);
        this.installedPackages = [];
        this.progress = progress;
    }

    getInstallers(): string[] {
        if (this.poetry.isInUse()) { return [SmartInstaller.poetryName]; }
        let result = [];
        if (this.poetry.lockFileExists()) {
            result.push(SmartInstaller.poetryName);
        }
        result.push(SmartInstaller.pipName);
        return result;
    }

    async getInstaller(): Promise<string | undefined> {
        const installers = this.getInstallers();
        if (!installers.length) { return undefined; }
        if (installers.length === 1) { return installers[0]; }
        const choices = installers.map(x => `Use ${x}`);
        this.reportProgress('Choose installer...');
        const choice = await window.showInformationMessage(
            'Multiple installers detected, pick one',
            ...choices
        );
        if (!choice) { return; }
        return installers[choices.indexOf(choice)];
    }

    async installPackages(installPackages: PypiPackage[], removePackages: PypiPackage[], version: string, dev: boolean) {
        const installer = await this.getInstaller();
        if (!installer) { return; }
        this.resetListPackages();

        console.log(`Using ${installer} for installation`);
        if (installer === SmartInstaller.poetryName) {
            return await this.installWithPoetry(installPackages, removePackages, version, dev);
        }

        if (installer === SmartInstaller.pipName) {
            return await this.installWithPip(installPackages, removePackages, version);
        }
    }

    async install(name: string, version: string, dev: boolean = false) {
        const installer = await this.getInstaller();
        if (!installer) { return; }
        this.resetListPackages();

        console.log(`Using ${installer} for installation`);
        if (installer === SmartInstaller.poetryName) {
            return await this.poetry.installPackage(name, version, [], dev);
        }

        if (installer === SmartInstaller.pipName) {
            return await this.pip.installPackage(name, version, [], dev);
        }
    }

    reportProgress(message: string): void {
        console.log(`Progress: ${message}`);
        this.progress && this.progress.report({ message });
    }

    async installWithPoetry(packages: PypiPackage[], removePackages: PypiPackage[], version: string, dev: boolean) {
        const masterPackage = packages.find(x => !x.getExtraName().length);
        const extraPackages = packages.filter(x => x.getExtraName());
        if (masterPackage) {
            this.reportProgress(`Installing ${extraPackages.length} services with Poetry...`);
            const extras = extraPackages.map(x => x.getExtraName());
            await this.poetry.installPackage(masterPackage.moduleName, version, extras, dev);
        } else {
            for (const extraPackage of extraPackages) {
                this.reportProgress(`Installing ${extraPackage.getLabel()} service with Poetry...`);
                await this.poetry.installPackage(extraPackage.moduleName, `<=${version}`, [], dev);
            }
        }
        for (const removePackage of removePackages) {
            this.reportProgress(`Removing ${removePackage.getLabel()} service with Poetry...`);
            await this.poetry.removePackage(removePackage.moduleName, dev);
        }
    }

    async installWithPip(installPackages: PypiPackage[], removePackages: PypiPackage[], version: string) {
        const masterPackage = installPackages.find(x => !x.getExtraName().length);
        const extraPackages = installPackages.filter(x => x.getExtraName());
        if (masterPackage) {
            this.reportProgress(`Installing ${extraPackages.length} services...`);
            const extrasNames = extraPackages.map(x => x.getExtraName());
            await this.pip.installPackage(masterPackage.moduleName, version, extrasNames, true);
        } else {
            for (const extraPackage of extraPackages) {
                this.reportProgress(`Installing ${extraPackage.getLabel()}...`);
                await this.pip.installPackage(extraPackage.moduleName, `<=${version}`, [], true);
            };
        }
        for (const removePackage of removePackages) {
            this.reportProgress(`Removing ${removePackage.getLabel()}...`);
            await this.pip.removePackage(removePackage.moduleName, true);
        };
    }

    async listPackages(): Promise<PipPackage[]> {
        if (this.installedPackages.length) { return this.installedPackages; }
        this.installedPackages = await this.pip.listPackages();
        return this.installedPackages;
    }

    resetListPackages(): void {
        this.installedPackages = [];
    }

    async getBoto3Version(): Promise<string> {
        try {
            return (await this.pip.exec(`${getPythonPath()} -c "import boto3; print(boto3.__version__)"`)).stdout;
        } catch (e) {
            return '';
        }
    }
}
