import { getApps as get_apps } from 'get-mac-apps'
import { writeJson as write_json, readJson as read_json, ensureFile as ensure_file, readdir as read_dir } from 'fs-extra'
import { resolve } from 'node:path'

import Store from './store'

interface App {
  _name: string;
  arch_kind: 'arch_i64' | any
  lastModified: Date,
  obtained_from: 'unknown' | 'identified_developer' | 'apple'
  path: string,
  version: string
}

export default {
  get_apps () {
    return get_apps()
      .then(async (apps: App[]) => {
        const panes = await this.get_macos_pref_panes()

        const _apps = apps
          .map(app => ({
            title: `${app._name} (${app.path})`,
            value: app.path
          }))
          .reduce((arr: any, curr: any) => {
            let _arr = arr

            _arr.push(curr)

            if (curr.title.toLowerCase().includes('preferences')) {
              _arr = _arr.concat(panes)
            }

            return _arr
          }, [])

        write_json(resolve(Store.get_storage_path(), 'apps'), _apps)

        return _apps
      })
      .catch((err: any) => err)
  },

  get_macos_pref_panes () {
    const _path = '/System/Library/PreferencePanes'

    return read_dir(_path)
      .then((panes: any) => panes.map((pane: any) => ({
        title: `[pref] ${pane.split('.')[0]} (${resolve(_path, pane)})`,
        value: resolve(_path, pane)
      })))
      .catch((err: any) => err)
  },

  get_cached_apps () {
    return read_json(resolve(Store.get_storage_path(), 'apps'))
  },

  async apps_cache_exists () {
    try {
      await ensure_file(resolve(Store.get_storage_path(), 'apps'))

      return true
    } catch (err: any) {
      console.error(err.message)
      return false
    }
  }

}
