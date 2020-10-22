# iCoreTech SpesaBot Desktop


[![Build Status](https://travis-ci.com/icoretech/spesabot-client.svg?branch=master&status=created)](https://travis-ci.com/icoretech/spesabot-client)

## Commands

This repo uses https://www.electronforge.io to build and publish releases.

Makers and Publishers are defined in package.json

### Run

```
npm run start
```

### Build for the current architecture

https://github.com/electron/fiddle/blob/master/forge.config.js
https://github.com/dirkschumacher/r-shiny-electron/issues/25

```
brew cask install xquartz
brew cask install wine-stable

npm run make
```

### Build for Windows on Mac

https://azukidigital.com/blog/2020/electron-windows-installer/
https://felixrieseberg.com/codesigning-electron-apps-in-ci/
https://github.com/dirkschumacher/r-shiny-electron/issues/25
https://github.com/joeireland/electron-circleci/blob/master/.circleci/config.yml

```
brew cask install xquartz
brew cask install wine-stable
# https://www.mono-project.com/download/stable/

electron-forge make --platform=win32
```

### Build and Publish

```
npm run publish
```

## Copyright

Copyright (c) 2020-2021 iCoreTech, Inc.
