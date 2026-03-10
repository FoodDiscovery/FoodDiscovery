const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Use a project-local cache directory to avoid EACCES permission errors
// when clearing cache (e.g. with `expo start -c`) on the system temp folder.
config.cacheStores = [
  new (require("metro-cache").FileStore)({
    root: path.join(__dirname, ".metro-cache"),
  }),
];

module.exports = config;
