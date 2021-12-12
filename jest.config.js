module.exports = {
  // preset: "ts-jest",
  // testEnvironment: "node"
  transform: {
    "^.+\\.(t|j)sx?$": [
      "@swc-node/jest",
      {
        dynamicImport: true,
      },
    ],
  },
  moduleNameMapper: {
    "^/(.*)$": "<rootDir>/src/$1",
  },
};
