---
to: packages/<%= name %>/tsconfig.build.json
---
{
  "extends": "../../tsconfig.build.json",
  "compilerOptions": {
    "declarationDir": "./dist",
    "rootDir": "./src",
    "baseUrl": "./"
  },
  "include": ["./src"]
}
