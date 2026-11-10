# Contributing

Thanks for helping improve History Cleaner. Discuss substantial changes in an issue before opening a pull request, follow the [Code of Conduct](CODE_OF_CONDUCT.md) and report vulnerabilities privately through [SECURITY.md](SECURITY.md). Contributions are released under the [GPL-3.0](LICENSE).

## Scope

The extension replaces Chrome's history page and deletes selections in batches. Changes should keep that focus. New permissions, network access and tracking of any kind will not be accepted.

## Set up

You need Node.js 22 or newer and a Chromium browser.

```sh
npm install
npm run validate
```

1. Open `chrome://extensions` and turn on **Developer mode**.
2. Click **Load unpacked** and choose the `src` folder.
3. After each change, click the reload icon on the extension card and refresh the history tab.

`npm run validate` checks the manifest, referenced files, JavaScript syntax and that every language has the same keys. CI runs the same check on every pull request.

## Adding a language

1. Add a block to `STRINGS` and an entry to `LANGS` and `LOCALES` in `src/i18n.js`. Copy the English block and translate every value.
2. Add the code to the language list in `scripts/validate.mjs`.
3. Run `npm run validate`.

## Guidelines

- Treat URLs and titles from history as untrusted: use `textContent`, never `innerHTML`, for them.
- Keep deletion batched and cancellable. Test with a history of several thousand entries.
- Follow `.editorconfig`: four-space indentation (two for YAML and JSON), LF line endings.
- Write user-facing text through `t()`, not as string literals in `history.js`.

## Pull requests

Describe the problem and the behavior after your change, include screenshots for visible changes and fill in the pull request template.
