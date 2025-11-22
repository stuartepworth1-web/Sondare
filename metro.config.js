const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('@/')) {
    const modPath = path.resolve(__dirname, moduleName.replace('@/', ''));
    try {
      return context.resolveRequest(context, modPath, platform);
    } catch (error) {
      // Fallback to default resolver
      return context.resolveRequest(context, moduleName, platform);
    }
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
