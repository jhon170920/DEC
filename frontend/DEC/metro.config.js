const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Allow Metro to bundle .bin model weight files
config.resolver.assetExts.push('tflite', 'wasm');

module.exports = config;