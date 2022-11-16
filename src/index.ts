import { exec } from 'node:child_process'
import prompts from 'prompts'

import apps from './apps'
import Store, { IThing } from './store'

interface IChoice {
  title: string
  value?: string
}

class K {

  store: any
  types: {
    [key: string]: boolean
  }

  constructor() {
    this.store = new Store()

    this.types = {
      app: true,
      cli: true,
      href: true
    }
  }

  async init() {
    await this.store.init()

    apps.get_apps()

    const things = await this.store.get()

    const res = await prompts({
      type: 'autocomplete',
      name: 'selected',
      message: 'select thing to run',
      choices: [
        ...things
          .sort((a: IThing, b: IThing) => (b.run_count || 0) - (a.run_count || 0))
          .map((thing: IThing) => ({
            title: `[${thing.app ? 'app' : thing.cli ? 'cli' : thing.href ? 'href' : '?'}] ${thing.name}${thing.cli || thing.href ? ` (${thing.cli || thing.href})` : ''}`, // thing.app ||
            value: thing._id
          })),
        { title: '+ add', value: 'add' },
        { title: '- remove', value: 'remove' }
      ],
      suggest: (input, choices) => Promise.resolve(
        choices.filter(({ title }) => title.toLowerCase().includes(input.toLowerCase()))
      )
    })

    if (res.selected) {
      this.handle_select(res.selected)
    }
  }

  async handle_select(opt: string) {
    switch (opt) {
      case 'add':
        this.show_add()
        break
      case 'remove':
        this.show_remove()
        break
      case 'exit':
        process.exit(0)
      default:
        this.run_or_launch_selected(opt)
        break
    }
  }

  async show_add() {
    let apps_list = []

    const apps_cache_exists = await apps.apps_cache_exists()

    if (apps_cache_exists) {
      apps_list = await apps.get_cached_apps()
    } else {
      apps_list = await apps.get_apps()
    }

    const { type_fields, type_options } = this.get_enabeld_types(apps_list)

    const res = await prompts([
      {
        type: 'select',
        name: 'type',
        message: 'select type',
        choices: type_options,
        validate: (val: string) => val.length ? true : 'type was not provided'
      },
      ...type_fields,
      {
        type: 'text',
        name: 'name',
        message: 'enter name',
        validate: (val: string) => val.length ? true : 'name can\'t be empty'
      }
    ])

    if (res && ((res.type === 'app' && res.app) || (res.type === 'cli' && res.cli) || (res.type === 'href') && res.href)) {
      await this.store.add(res)

      console.log('[info] added')
    }
  }

  async show_remove() {
    const things = await this.store.get()

    const res = await prompts([
      {
        type: 'multiselect',
        name: 'to_remove',
        message: 'select things to delete',
        choices: [
          ...things.map((thing: IThing) => ({
            title: `${thing.name} (${thing.app || thing.cli || thing.href})`,
            value: thing._id
          }))
        ],
        suggest: (input, choices) => Promise.resolve(
          choices.filter(({ title }) => title.toLowerCase().includes(input.toLowerCase()))
        )
      }
    ])

    if (res.to_remove && res.to_remove.length) {
      await Promise.all(
        res.to_remove.map((_id: string) => this.store.remove(_id))
      )

      console.log(`[info] removed ${res.to_remove.length} thing${res.to_remove.length === 1 ? '' : 's'}`)
    }
  }

  get_enabeld_types(apps_list: IChoice[]) {
    const type_fields = []
    const type_options = []

    if (this.type_enabled('app')) {
      type_fields.push({
        type: (prev: string) => prev === 'app' ? 'autocomplete' : null,
        name: 'app',
        message: 'select app',
        choices: apps_list,
        suggest: (input: any, choices: IChoice[]) => Promise.resolve(
          choices.filter(({ title }) => title.toLowerCase().includes(input.toLowerCase()))
        ),
        validate: (val: string) => val.length ? true : 'app was not selected'
      })

      type_options.push({ title: 'app', value: 'app' })
    }

    if (this.type_enabled('cli')) {
      type_fields.push({
        type: (prev: string) => prev === 'cli' ? 'text' : null,
        name: 'cli',
        message: '>',
        validate: (val: string) => val.length ? true : 'cli command was not provided'
      })

      type_options.push({ title: 'cli command', value: 'cli' })
    }

    if (this.type_enabled('href')) {
      type_fields.push({
        type: (prev: string) => prev === 'href' ? 'text' : null,
        name: 'href',
        message: 'https://...',
        validate: (val: string) => val.length ? true : 'url link was not provided'
      })

      type_options.push({ title: 'href', value: 'href' })
    }

    return { type_fields, type_options }
  }

  async run_or_launch_selected(opt: string) {
    const thing = await this.store.get({ _id: opt })

    await this.store.update(thing._id, { run_count: thing.run_count ? thing.run_count + 1 : 1 })

    if (!thing) return

    if (thing.type === 'app') {
      exec(`open ${thing.app.replace(/ /g, '\\ ')}`, (err, stdout, stderr) => {
        if (err) {
          console.log(`exec error: ${err}`)
          return
        }

        console.log('[info] ok')
        console.log(stdout)
        console.log(stderr)
      })
    } else if (thing.type === 'cli') {
      exec(`${thing.cli}`, (err, stdout, stderr) => {
        if (err) {
          console.log(`exec error: ${err}`)
          return
        }

        console.log('[info] ok')
        console.log(stdout)
        console.log(stderr)
      })
    } else if (thing.type === 'href') {
      exec(`open ${thing.href}`, (err, stdout, stderr) => {
        if (err) {
          console.log(`exec error: ${err}`)
          return
        }

        console.log('[info] ok')
        console.log(stdout)
        console.log(stderr)
      })
    }
  }

  type_enabled(type: string) {
    return this.types[type] === true
  }

}

export default K
