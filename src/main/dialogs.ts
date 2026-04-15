import { BrowserWindow, dialog } from 'electron';

export async function pickJars(): Promise<string[]> {
  const win = BrowserWindow.getFocusedWindow() ?? undefined;
  const result = await dialog.showOpenDialog(win!, {
    title: 'Select mod jars to import',
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'Minecraft mods', extensions: ['jar'] }]
  });
  return result.canceled ? [] : result.filePaths;
}

export async function pickShaderZips(): Promise<string[]> {
  const win = BrowserWindow.getFocusedWindow() ?? undefined;
  const result = await dialog.showOpenDialog(win!, {
    title: 'Select shader packs to import',
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'Shader packs', extensions: ['zip'] }]
  });
  return result.canceled ? [] : result.filePaths;
}
