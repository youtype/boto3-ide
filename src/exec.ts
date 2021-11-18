import { exec as _exec } from 'child_process'
import { promisify } from 'util'
import { window } from 'vscode'

const exec = promisify(_exec)

export default async function (cmd: string): Promise<{ stdout: string; stderr: string }> {
  try {
    const { stderr, stdout } = await exec(cmd)
    return { stderr, stdout }
  } catch (e) {
    const error = e as any
    console.error('error')
    console.error(error.message)
    console.error('stdout')
    console.error(error.stdout)
    console.error('stderr')
    console.error(error.stderr)
    const message = (e as Error).message
    throw new Error(`${cmd} failed: ${message}`)
  }
}
