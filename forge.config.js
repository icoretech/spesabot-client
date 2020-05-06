module.exports = {
    packagerConfig: {
        asar: true,
        darwinDarkModeSupport: true,
        name: 'SpesaBot',
        osxSign: {
            identity: process.env.OSX_SIGN_IDENTITY,
            hardenedRuntime: true,
            'gatekeeper-assess': false,
            entitlements: 'src/entitlements.plist',
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
        config: {
            name: 'spesabot_desktop'
        }
    }, {
        name: '@electron-forge/maker-zip',
        platforms: [
            'darwin',
            'linux'
        ]
    }, {
        name: '@electron-forge/maker-dmg',
        config: {
            format: 'ULFO'
        }
    }, {
        name: '@electron-forge/maker-deb',
        config: {}
    }, {
        name: '@electron-forge/maker-rpm',
        config: {}
    }]
}
