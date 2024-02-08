# README

## Install

install node (and npm)

`cd devfiles` once

`npm install` once

`npx vite preview` for testing

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
