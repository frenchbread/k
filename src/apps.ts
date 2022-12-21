import { ensureFile as ensure_file, readJson as read_json, writeJson as write_json } from 'fs-extra'
import { getApps as get_apps } from 'get-mac-apps'
import { resolve } from 'node:path'

import Store from './store'

interface App {
  _name: string
  arch_kind: 'arch_i64' | any
  lastModified: Date,
  obtained_from: 'unknown' | 'identified_developer' | 'apple'
  path: string,
  version: string
}

export default {
  get_apps() {
    return get_apps()
      .then(async (apps: App[]) => {
        const _apps = apps
          .map(app => ({
            title: `${app._name} (${app.path})`,
            value: app.path
          }))
          .reduce((arr: any, curr: any) => {
            const _arr = arr

            _arr.push(curr)

            return _arr
          }, [])

        await write_json(resolve(Store.get_storage_path(), 'apps'), _apps)

        return _apps
      })
      .catch((err: any) => err)
  },

  get_cached_apps() {
    return read_json(resolve(Store.get_storage_path(), 'apps'))
  },

  async apps_cache_exists() {
    try {
      await ensure_file(resolve(Store.get_storage_path(), 'apps'))

      return true
    } catch (err: any) {
      return false
    }
  }

}

