import { ensureFile as ensure_file, readJson as read_json, writeJson as write_json } from 'fs-extra'
import { resolve } from 'path'
import Store from './store'

interface Prefs {
  launches_count: number
}

export async function update(changes: Prefs) {
  const prefs_path = resolve(Store.get_storage_path(), 'prefs')

  await ensure_file(prefs_path)
    .then(async () => {
      const prefs = await read_json(prefs_path)
  
      await write_json(prefs_path, { ...prefs, ...changes })
  
      console.log('settings updated')
    })
    .catch(async () => {
      await write_json(prefs_path, { ...changes })
  
      console.log('settings saved')
    })
}

export async function get(key: string) {
  const prefs_path = resolve(Store.get_storage_path(), 'prefs')
    
  return await ensure_file(prefs_path)
    .then(async () => {
      const prefs = await read_json(prefs_path)
  
      return prefs[key]
    })
    .catch(() => {
      return null
    })
}