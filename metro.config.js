const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('@/')) {
    const modPath = moduleName.replace('@/', '');
    return context.resolveRequest(
      context,
      path.resolve(__dirname, modPath),
      platform
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
