---
to: packages/<%= name %>/package.json
---
{
  "name": "@faedev/<%= name %>",
  "version": "1.0.0",
  "private": false,
  "main": "index.ts",
  "license": "MIT",
  "scripts": {
    "build:declaration": "tsc --project tsconfig.build.json",
    "build:es": "BABEL_ENV=build babel src --root-mode upward --out-dir dist --source-maps --extensions .ts,.tsx --delete-dir-on-start --no-comments"
  }
}



