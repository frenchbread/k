import rs from 'rocket-store'
import path from 'node:path'
import { ObjectID } from 'bson'

const DB_NAME = '../store'

export interface IThing {
  _id: string,
  name: string,
  type: string,
  app?: string,
  cli?: string,
  href?: string,
  created_at: number
}

export default class Store {

  static get_storage_path () {
    return path.resolve(__dirname, DB_NAME)
  }

  async init () {
    await rs.options({
      data_storage_area: Store.get_storage_path(),
      data_format: rs._FORMAT_JSON
    })
  }

  async get ({ _id = '*', name = '*' } = {}) {
    const { result, count } = await rs.get('things', `${_id}-${name}`)

    return count !== 0
      ? _id === '*' ? result || [] : result[0]
      : _id === '*' ? [] : null
  }

  async add (data: IThing) {
    if (!data.name) throw new Error('name is required')

    Object.assign(
      data,
      {
        _id: data._id || new ObjectID().toString(),
        created_at: data.created_at || Date.now()
      }
    )

    await rs.post('things', `${data._id}-${data.name}`, data)

    return this.get({ _id: data._id, name: data.name })
  }
}
