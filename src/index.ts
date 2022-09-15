import prompts from 'prompts'
import { exec } from 'node:child_process'

import Store, { IThing } from './store'
import apps from './apps'

class K {

  store: any

  constructor () {
    this.store = new Store()
  }

  async init () {
    await this.store.init()

    apps.get_apps()

    const things = await this.store.get()

    const res = await prompts({
      type: 'autocomplete',
      name: 'selected',
      message: 'select thing to run',
      choices: [
        ...things.map((thing: IThing) => ({
          title: `${thing.name} (${thing.app || thing.cli})`,
          value: thing._id
        })),
        { title: '+ add', value: 'add' }
      ],
      suggest: (input, choices) => Promise.resolve(
        choices.filter(({ title }) => title.toLowerCase().includes(input.toLowerCase()))
      )
    })

    if (res.selected) {
      this.handle_select(res.selected)
    }
  }

  async handle_select (opt: string) {
    switch (opt) {
    case 'add':
      this.show_add()
      break
    case 'exit':
      process.exit(0)
      break
    default:
      this.run_or_launch_selected(opt)
      break
    }
  }

  async show_add () {
    let apps_list = []

    const apps_cache_exists = await apps.apps_cache_exists()

    if (apps_cache_exists) {
      apps_list = await apps.get_cached_apps()
    } else {
      apps_list = await apps.get_apps()
    }

    const res = await prompts([
      {
        type: 'text',
        name: 'name',
        message: 'enter name',
        validate: val => val.length ? true : 'name can\'t be empty'
      },
      {
        type: 'select',
        name: 'type',
        message: 'select type',
        choices: [
          { title: 'app', value: 'app'},
          { title: 'cli command', value: 'cli' }
        ]
      },
      {
        type: prev => prev === 'app' ? 'autocomplete' : null,
        name: 'app',
        message: 'select app',
        choices: apps_list,
        suggest: (input, choices) => Promise.resolve(
          choices.filter(({ title }) => title.toLowerCase().includes(input.toLowerCase()))
        )
      },
      {
        type: prev => prev === 'cli' ? 'text' : null,
        name: 'cli',
        message: '>',
        validate: val => val.length ? true : 'cli command can\'t be empty'
      }
    ])

    if (res && (res.type === 'app' || res.type === 'cli')) {
      await this.store.add(res)

      console.log('[info] added')
    }
  }

  async run_or_launch_selected (opt: string) {
    const thing = await this.store.get({ _id: opt })

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
    }
  }

}

export default K
