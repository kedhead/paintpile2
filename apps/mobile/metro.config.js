const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Extend watchFolders to include monorepo root (keeps Expo defaults)
config.watchFolders = [...(config.watchFolders || []), monorepoRoot];

// Resolve packages from both local and root node_modules
// Local (mobile) must come first so React 18 wins over root's React 19
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Force react, react-native, and react-dom to resolve from mobile workspace
// This prevents the root React 19 (from web app) from being used
const mobileModules = path.resolve(projectRoot, 'node_modules');
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Pin these packages to the mobile workspace copy
  if (moduleName === 'react' || moduleName === 'react-native' || moduleName === 'react-dom' ||
      moduleName.startsWith('react/') || moduleName.startsWith('react-native/') || moduleName.startsWith('react-dom/')) {
    const newContext = {
      ...context,
      nodeModulesPaths: [mobileModules],
    };
    if (originalResolveRequest) {
      return originalResolveRequest(newContext, moduleName, platform);
    }
    return context.resolveRequest(newContext, moduleName, platform);
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css' });
