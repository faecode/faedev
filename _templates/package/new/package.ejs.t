---
to: packages/<%= name %>/package.json
---
{
  "name": "@faedev/<%= name %>",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "license": "MIT",
  "private": false,
  "files": ["dist"],
  "scripts": {
    "build:declaration": "tsc --project tsconfig.build.json",
    "build:es": "BABEL_ENV=build babel src --root-mode upward --out-dir dist --source-maps --extensions .ts,.tsx --delete-dir-on-start --no-comments"
  },
  "publishConfig": {
    "access": "public"
  }
}