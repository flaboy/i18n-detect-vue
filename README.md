# @cybersailor/i18n-detect-vue

CLI tools for Vue i18n quality checks:

- detect hardcoded strings in `.vue/.ts/.js`
- detect missing i18n keys against a language JSON file

## Install

```bash
npm install -D @cybersailor/i18n-detect-vue
```

## CLI

```bash
i18n-detect-vue <file>
i18n-check-keys-vue <file> <lang_json_file>
```

## Output

- hardcoded string output:
  - `filepath:line\ttext\tcontext\tpriority`
- missing key output:
  - `filepath:line\tkey`

