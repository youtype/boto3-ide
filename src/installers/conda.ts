import { BaseInstaller } from './base'
import * as path from 'path'
import * as fs from 'fs'

export default class CondaInstaller extends BaseInstaller {
  name = 'conda'
  description = 'Uses conda to install packages. (experimental)'
  supportsExtras = false

  async installPackage(
    name: string,
    version: string,
    extras: string[],
    dev: boolean
  ): Promise<void> {
    const packageName = this.buildPackageName(name, extras)
    const versionConstraint = version ? this.buildVersionConstraint(version) : ''
    const command = version ? 'install' : 'update'
    const installerCmd = 'conda'
    const cmd = `${installerCmd} ${command} --channel=conda-forge -y "${packageName}${versionConstraint}"`
    await this.condaExec(cmd)
  }

  async removePackage(name: string, dev: boolean): Promise<void> {
    const installerCmd = await this.getInstallerCmd()
    const cmd = `${installerCmd} uninstall -n ${dev ? '--dev' : ''} "${name}"`
    await this.condaExec(cmd)
  }

  getCondaMetaPaths(interpreterPath: string): string[] {
    const condaMetaDir = 'conda-meta'

    const condaEnvDir1 = path.join(path.dirname(interpreterPath), condaMetaDir)
    const condaEnvDir2 = path.join(path.dirname(path.dirname(interpreterPath)), condaMetaDir)

    return [condaEnvDir1, condaEnvDir2]
  }

  isPresent(): boolean {
    const condaMetaPaths = this.getCondaMetaPaths(this.mainPythonPath)
    for (const condaMeta of condaMetaPaths) {
      if (fs.existsSync(condaMeta)) {
        return true
      }
    }
    return false
  }

  async condaExec(cmd: string): Promise<{ stdout: string; stderr: string }> {
    const condaExe = process.env.CONDA_EXE
    const condaEnv = process.env.CONDA_DEFAULT_ENV
    const activateCmd = path.join(path.dirname(this.mainPythonPath), 'activate')
    const prefix = `${activateCmd} && ${condaExe} activate ${condaEnv}`
    return await this.exec(`${prefix} && ${cmd}`)
  }
}
