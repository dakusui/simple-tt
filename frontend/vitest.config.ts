import next from 'next/jest';

const createJestConfig = next();

export default createJestConfig({
  testEnvironment: 'jsdom',
});
