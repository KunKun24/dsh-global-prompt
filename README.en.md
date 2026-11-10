# dsh-global-prompt

One global prompt or persona, injected into every new conversation.

## What it does

Write a persona and/or a prompt once in the sidebar panel; every **new**
conversation starts with it as an extra system-prompt section, inserted right
after the deployment persona.

- Total limit 4000 characters, 2000 per part, so a request can never be blown up
- Injected on the first turn only — later turns return an empty string
- Per-scope counter uses a `WeakMap`; the scope object is never serialised
  (Cordis guard proxies throw on `JSON.stringify`, which would break every
  outgoing message)

## Settings

Sidebar → "全局提示词". Three switches: Chinese-thinking preset, persona, prompt.
The state lives in `$DSH_HOME/global-prompt.json` (mode 0600) and is editable
through `GET/POST /api/global-prompt/state`, so the panel and the host always
agree.

## Install

### Plugin marketplace

Search for `dsh-global-prompt` in the Harness plugin marketplace and install it.

### Release tarball

```bash
dsh plugin --profile web add ./dsh-global-prompt-1.0.0.tgz
```

### Manual

```bash
cp -r dsh-global-prompt ~/.dsh/profiles/web/vendor/
# add to ~/.dsh/profiles/web/package.json
#   "dependencies": { "dsh-global-prompt": "file:./vendor/dsh-global-prompt" }
cd ~/.dsh/profiles/web && pnpm install && dsh web
```

Restart the instance after installing.

## Uninstall

Remove it from `dsh.profile.bundles` and `dependencies`, run `pnpm install` and
restart. Delete `$DSH_HOME/global-prompt.json` if you also want to drop the text.

## License

MIT © 2026 困困
