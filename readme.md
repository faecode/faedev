# A monorepo for FAE platform related open-source libraries

## Development
To add new package:
- have a hygen cli tool installed - npm intall -g hygen
- run hygen package new package-name

## Adding dependencies
### Adding global development dependencies
Install a new development dependency into monorepo root with `yarn add dependency -DW`
### Adding global dependency
Install a new dependency with `yarn add dependency`
### Installing a package dependency
To install a dependency related to a package use `yarn workspace @faedev/package-name add dependency

## Buliding
To build all the packages run `yarn build`

## Testing

Tests are using Jest library.

To run all tests in monorepo run `yarn test`

## Commiting changes

Use `yarn commit` to commit your changes.

Fill in:
required:
- type of change
- scope of change
- description of change
optional:
- long description
- breaking changes
- packages affected
