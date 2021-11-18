import { ExtensionContext } from 'vscode'
import { BaseInstaller } from '../installers/base'
import { createSmartInstaller } from '../installers/smart'

export default async function handle(context: ExtensionContext): Promise<BaseInstaller | void> {
  const smartInstaller = await createSmartInstaller(context)
  const installers = smartInstaller.getInstallers()
  return await smartInstaller.selectInstaller(installers)
}
