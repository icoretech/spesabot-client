# iCoreTech SpesaBot Desktop

[![Build Status](https://drone.icorete.ch/api/badges/icoretech/nucleus/status.svg)](https://drone.icorete.ch/icoretech/nucleus)

[Nucleus](https://bitbucket.org/icoretech/nucleus/src) is an electron based desktop application.

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

brew cask install xquartz
brew cask install wine-stable

```
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
https://www.mono-project.com/download/stable/

```
electron-forge make --platform=win32
```

### Build and Publish

```
npm run publish
```

This command will build and publish packages on https://nucleus.icorete.ch

## Copyright

Copyright (c) 2020 iCoreTech, Inc.
# spesabot-desktop
