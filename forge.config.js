/* tslint:disable */

const path = require('path')
const fs = require('fs')
const packageJson = require('./package.json')

const { version } = packageJson
const iconDir = path.resolve(__dirname, 'assets', 'icons')

const config = {
  // hooks: {
  //   generateAssets: require('./tools/generateAssets')
  // },
  packagerConfig: {
    name: 'SpesaBot',
    executableName: 'spesabot',
    asar: true,
    appBundleId: process.env.APPLE_BUNDLE_ID,
    appCategoryType: 'public.app-category.developer-tools',
    darwinDarkModeSupport: true,

    win32metadata: {
      CompanyName: 'SpesaBot',
      OriginalFilename: 'SpesaBot',
    },
    osxSign: {
      identity: process.env.OSX_SIGN_IDENTITY,
      hardenedRuntime: true,
      'gatekeeper-assess': false,
      'entitlements': 'src/entitlements.plist',
      'entitlements-inherit': 'src/entitlements.plist',
      'signature-flags': 'library'
    },
    osxNotarize: {
      appBundleId: process.env.APPLE_BUNDLE_ID,
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_PASSWORD,
      ascProvider: process.env.APPLE_ASC_PROVIDER
    }
  },
  publishers: [{
    name: '@electron-forge/publisher-nucleus',
    config: {
      host: 'https://nucleus.icorete.ch',
      appId: 1,
      channelId: 'production',
      token: 'boh'
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
        // setupIcon: path.resolve(iconDir, 'fiddle.ico'),
        certificatePassword: process.env.WINDOWS_CERTIFICATE_PASSWORD,
        certificateFile
      }
    }
  }, {
    name: '@electron-forge/maker-zip',
    platforms: ['darwin']
  }, {
    name: '@electron-forge/maker-deb',
    platforms: ['linux'],
    config: {}
  }, {
    name: '@electron-forge/maker-rpm',
    platforms: ['linux']
  }]
}

// Finally, export it
module.exports = config
