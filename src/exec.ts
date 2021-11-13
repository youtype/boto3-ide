import { exec as _exec } from "child_process";
import { promisify } from "util";
import { window } from "vscode";

const exec = promisify(_exec);

export default async function (cmd: string): Promise<{ stdout: string, stderr: string }> {
    try {
        const { stderr, stdout } = await exec(cmd);
        return { stderr, stdout };
    } catch (e) {
        console.error(e);
        const message = (e as Error).message;
        window.showErrorMessage(`${cmd} failed: ${message}`);
        throw new Error(message);
    }
}
