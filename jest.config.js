const nextJest = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup-tests.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/src/components/(.*)$': '<rootDir>/src/components/$1',
  },
  testMatch: ['**/__tests__/**/*.{js,jsx,ts,tsx}'],
  collectCoverageFrom: ['**/*.{js,jsx,ts,tsx}'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  transform: {
    '^.+\\.(css|less|scss|sass)$': 'jest-transform-stub'
  },
};