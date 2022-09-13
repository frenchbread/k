import { getApps as get_apps } from 'get-mac-apps'

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
      .then((apps: App[]) => apps.map(app => ({
        title: `${app._name} (${app.path})`,
        value: app.path
      })))
      .catch((err: any) => err)
  }
}
