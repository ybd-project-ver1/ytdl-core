/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
    preset: 'ts-jest',
    rootDir: './test',
    testEnvironment: 'node',
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {}],
    },
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    testEnvironmentOptions: {
        customExportConditions: ['node', 'node-addons'],
    },
};
