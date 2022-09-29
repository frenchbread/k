### k

> CLI items launcher

- macOs apps
- run shell commands (aka `alias`)
- open urls (aka `bookmarks`)

### ⚙️ setup

```sh
# install
❯ npm i k-one -g

# run
❯ k-one
```

You can alias it into something shorter e.g. `k`. Or add a workflow (e.g. keybind) that starts terminal sesh (window) with this command.

#### 📔 adding items

Adding is done by selecting `+ add` option and filling out prompt fields:

  - type
    - `app` (only `macOs` currently supported)
      - select app
    - `cli command`
      - shell script
    - `href`
      - url
  - name

#### 🗑️ removing items

Removing items is done by selecting `- remove` option and multi-selecting items from the list.

#### 🚀 main screen

```
- items[]
  - _id
  - name
  - type [cli_command run, app launch, browser link]
- + add
- - remove
```

### 🛠️ development

**clone the repo**

```sh
❯ git clone https://github.com/frenchbread/k.git && cd k
```

**install dependencies**

```sh
❯ npm i
```

**start**

```sh
❯ npm run start
```

**build**

```sh
❯ npm run build
```

### License

[MIT](https://github.com/frenchbread/k/blob/main/LICENSE)
