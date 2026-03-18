const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Allow Metro to bundle .bin model weight files
config.resolver.assetExts.push('bin');

module.exports = config;