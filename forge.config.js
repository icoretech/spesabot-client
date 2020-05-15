/* tslint:disable */

const path = require('path')
const fs = require('fs')
const packageJson = require('./package.json')

const {
  version
} = packageJson
const iconDir = path.resolve(__dirname, 'assets', 'icons')

const config = {
  // hooks: {
  //   generateAssets: require('./tools/generateAssets')
  // },
  packagerConfig: {
    name: 'SpesaBot',
    executableName: 'spesabot',
    // asar: {
    //   unpack: "node_modules/puppeteer/.local-chromium/**/*"
    // },
    asar: false,
    icon: path.resolve(__dirname, 'assets', 'icons', 'spesabot'),
    appBundleId: process.env.APPLE_BUNDLE_ID,
    appCategoryType: 'public.app-category.utilities',
    win32metadata: {
      CompanyName: 'SpesaBot',
      OriginalFilename: 'SpesaBot',
    },
    osxSign: {
      identity: process.env.OSX_SIGN_IDENTITY,
      'hardenedRuntime': true,
      'gatekeeper-assess': false,
      'entitlements': 'static/entitlements.plist',
      'entitlements-inherit': 'static/entitlements.plist',
      'signature-flags': 'library'
    },
    ignore: [
      /\/assets(\/?)/,
      /\/tools(\/?)/,
      /\/remote(\/?)/,
      /package-lock\.json/,
      /Readme\.md/,
      /bump\.sh/,
      /.travis\.yml/,
      /cert.p12/,
      /appveyor\.yml/
    ],
    osxNotarize: {
      appBundleId: process.env.APPLE_BUNDLE_ID,
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_PASSWORD,
      ascProvider: process.env.APPLE_ASC_PROVIDER
    }
  },
  // plugins: [
  //   ['@electron-forge/plugin-auto-unpack-natives']
  // ],
  publishers: [{
    name: '@electron-forge/publisher-nucleus',
    config: {
      host: 'https://nucleus.icorete.ch',
      appId: '1',
      channelId: '5bc3702a82f36211a0bd4d5e431f74ca',
      token: process.env.NUCLEUS_TOKEN
    }
  }],
  makers: [{
    name: '@electron-forge/maker-squirrel',
    platforms: ['win32'],
    config: (arch) => {
      const certificateFile = process.env.CI ?
        path.join(__dirname, 'cert.p12') :
        process.env.WINDOWS_CERTIFICATE_FILE;

      if (!certificateFile || !fs.existsSync(certificateFile)) {
        console.warn(`Warning: Could not find certificate file at ${certificateFile}`)
      }

      return {
        name: 'spesabot',
        authors: 'SpesaBot',
        exe: 'spesabot.exe',
        iconUrl: 'https://raw.githubusercontent.com/electron/fiddle/0119f0ce697f5ff7dec4fe51f17620c78cfd488b/assets/icons/fiddle.ico',
        // loadingGif: './assets/loading.gif',
        noMsi: true,
        remoteReleases: '',
        setupExe: `spesabot-${version}-${arch}-setup.exe`,
        setupIcon: path.resolve(iconDir, 'spesabot.ico'),
        certificatePassword: process.env.WINDOWS_CERTIFICATE_PASSWORD,
        certificateFile
      }
    }
  }, {
    name: '@electron-forge/maker-zip',
    platforms: ['darwin', 'win32']
  }, {
    name: '@electron-forge/maker-dmg',
    platforms: ['darwin'],
    config: {
      // background: './assets/dmg-background.png',
      format: 'ULFO'
    }
  }, {
    name: '@electron-forge/maker-deb',
    platforms: ['linux'],
    config: {
      options: {
        name: 'spesabot',
        productName: 'SpesaBot',
        maintainer: 'SpesaBot',
        homepage: 'https://www.spesabot.com',
        categories: ['Utility'],
        icon: path.resolve(iconDir, 'spesabot.png'),
        section: 'utils'
      }
    }
  }, {
    name: '@electron-forge/maker-rpm',
    platforms: ['linux'],
    config: {
      options: {
        name: 'spesabot',
        productName: 'SpesaBot',
        maintainer: 'SpesaBot',
        homepage: 'https://www.spesabot.com',
        categories: ['Utility'],
        icon: path.resolve(iconDir, 'spesabot.png')
      }
    }
  }]
}

// Finally, export it
module.exports = config
