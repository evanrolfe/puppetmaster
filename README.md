# PnTest

## Install

First, clone the repo via git:

```bash
git clone --depth 1 https://github.com/evanrolfe/pntest
```

And then install the dependencies with yarn.

```bash
$ cd your-project-name
$ ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES=true yarn install
```

## Run

Start the app in the `dev` environment.

```bash
$ yarn dev
```

Start the backend too:

```bash
$ NODE_ENV=development yarn start-backend
```

## Test

```bash
$ yarn test
```

## Debug

To debug the backend, you can start the backend with a debugger attached using vscode.
Go VSCode => Debug, then start launch "Backend [DEVELOPMENT]".

To debug the backend from a test, in VSCode debugger, launch "Backend [TEST]",
then run the test with the `--no-backend` or `-nb` option:

```bash
$ yarn test -nb
```

## Run in production

Build:

```bash
$ yarn build
```

This will compile files to ./dist folder. Then:

```bash
$ yarn start-prod
```

## Packaging

To package apps for all platforms:

```bash
$ yarn package-all
```

Which create packages in the ./release folder.
