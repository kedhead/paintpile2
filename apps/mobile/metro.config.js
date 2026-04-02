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

// Force critical packages to resolve from the mobile workspace
config.resolver.extraNodeModules = {
  react: path.resolve(projectRoot, 'node_modules/react'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
  'react-dom': path.resolve(projectRoot, 'node_modules/react-dom'),
};

module.exports = withNativeWind(config, { input: './global.css' });
