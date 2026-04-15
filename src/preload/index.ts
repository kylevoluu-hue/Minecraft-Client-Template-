import { contextBridge, ipcRenderer } from 'electron';
import type { UCApi } from '@shared/types';

// All IPC goes through this typed bridge. The renderer never gets raw
// ipcRenderer access, which keeps the attack surface small.
const api: UCApi = {
  profiles: {
    list: () => ipcRenderer.invoke('profiles:list'),
    create: (input) => ipcRenderer.invoke('profiles:create', input),
    update: (id, patch) => ipcRenderer.invoke('profiles:update', id, patch),
    remove: (id) => ipcRenderer.invoke('profiles:remove', id),
    setActive: (id) => ipcRenderer.invoke('profiles:setActive', id),
    getActive: () => ipcRenderer.invoke('profiles:getActive')
  },
  mods: {
    scan: (profileId) => ipcRenderer.invoke('mods:scan', profileId),
    setEnabled: (profileId, modId, enabled) =>
      ipcRenderer.invoke('mods:setEnabled', profileId, modId, enabled),
    setCategory: (modId, category) =>
      ipcRenderer.invoke('mods:setCategory', modId, category)
  },
  shaders: {
    scan: (profileId) => ipcRenderer.invoke('shaders:scan', profileId),
    select: (profileId, shaderId) =>
      ipcRenderer.invoke('shaders:select', profileId, shaderId)
  },
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    update: (patch) => ipcRenderer.invoke('settings:update', patch)
  },
  launch: {
    start: (profileId) => ipcRenderer.invoke('launch:start', profileId)
  }
};

contextBridge.exposeInMainWorld('uc', api);
