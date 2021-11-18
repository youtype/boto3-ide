import { window, Progress, ExtensionContext } from 'vscode'
import { createSmartInstaller } from './installers/smart'

export async function getOrInstallBoto3Version(context: ExtensionContext): Promise<string> {
  const smartInstaller = await createSmartInstaller(context)
  const boto3Version = await smartInstaller.getBoto3Version()
  if (boto3Version) {
    return boto3Version
  }

  const action = await window.showErrorMessage(
    `boto3 is not installed in ${smartInstaller.mainPythonPath}!`,
    `Install now`
  )
  if (!action) {
    return ''
  }

  await smartInstaller.install('boto3', '', false)
  return await smartInstaller.getBoto3Version()
}
