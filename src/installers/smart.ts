import PoetryInstaller from './poetry';
import PipInstaller from './pip';
import { PypiPackage } from '../pypi';
import { Progress, window } from 'vscode';
import { getPythonPath, getWorkDir } from '../pythonPath';
import PipPackage from './pipPackage';
import PipenvInstaller from './pipenv';
import { BaseInstaller } from './base';



export default class SmartInstaller {
    pythonPath: string;
    workDir: string;
    poetry: PoetryInstaller;
    pip: PipInstaller;
    pipenv: PipenvInstaller;
    installedPackages: PipPackage[];
    progress: Progress<unknown> | undefined;

    constructor(progress?: Progress<unknown>) {
        this.pythonPath = getPythonPath();
        this.workDir = getWorkDir();
        this.poetry = new PoetryInstaller(this.pythonPath, this.workDir);
        this.pip = new PipInstaller(this.pythonPath, this.workDir);
        this.pipenv = new PipenvInstaller(this.pythonPath, this.workDir);
        this.installedPackages = [];
        this.progress = progress;
    }

    getInstallers(): BaseInstaller[] {
        if (this.poetry.isInUse()) { return [this.poetry]; }
        if (this.pipenv.isInUse()) { return [this.pipenv]; }
        let result = [];
        if (this.poetry.lockFileExists()) {
            result.push(this.poetry);
        }
        if (this.pipenv.lockFileExists()) {
            result.push(this.pipenv);
        }
        result.push(this.pip);
        return result;
    }

    async getInstaller(): Promise<BaseInstaller | undefined> {
        const installers = this.getInstallers();
        if (!installers.length) { return undefined; }
        if (installers.length === 1) { return installers[0]; }
        const choices = installers.map(x => `Use ${x.name}`);
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

        this.reportProgress(`Installing with ${installer.name}...`);
        await this._installPackages(installer, installPackages, removePackages, version, dev);
    }

    async install(name: string, version: string, dev: boolean = false) {
        const installer = await this.getInstaller();
        if (!installer) { return; }
        this.resetListPackages();

        this.reportProgress(`Installing ${name} ${version} with ${installer.name}...`);
        return await installer.installPackage(name, version, [], dev);
    }

    reportProgress(message: string): void {
        console.log(`Progress: ${message}`);
        this.progress && this.progress.report({ message });
    }

    async _installPackages(installer: BaseInstaller, packages: PypiPackage[], removePackages: PypiPackage[], version: string, dev: boolean) {
        const masterPackage = packages.find(x => !x.getExtraName().length);
        const extraPackages = packages.filter(x => x.getExtraName());
        if (masterPackage) {
            this.reportProgress(`Installing ${extraPackages.length} services with ${installer.name}...`);
            const extras = extraPackages.map(x => x.getExtraName());
            await installer.installPackage(masterPackage.moduleName, version, extras, dev);
        } else {
            for (const extraPackage of extraPackages) {
                this.reportProgress(`Installing ${extraPackage.getLabel()} service with ${installer.name}...`);
                await installer.installPackage(extraPackage.moduleName, `<=${version}`, [], dev);
            }
        }
        for (const removePackage of removePackages) {
            this.reportProgress(`Removing ${removePackage.getLabel()} service with ${installer.name}...`);
            await installer.removePackage(removePackage.moduleName, dev);
        }
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
