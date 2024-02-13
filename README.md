# README

## Install

install node (and npm)

`cd devfiles` once

`npm install` once

`npm run dev` for testing

## Build

Run `npm run build` and merge to main branch when no errors

Run `npm run lint` to see warnings. See those related to yours and fix them.

## Setup Pre-Commit Hooks

In the root folder
```
npm run prepare
npm install
npx husky-init
git restore .husky
```
Now when you commit, the files be linted and tested.

## Workflow

`npm run dev` for live webserver
