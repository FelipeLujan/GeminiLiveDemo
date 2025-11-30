const { getDefaultConfig } = require('expo/metro-config');
const { wrapWithAudioAPIMetroConfig } = require('react-native-audio-api/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = wrapWithAudioAPIMetroConfig(config);
