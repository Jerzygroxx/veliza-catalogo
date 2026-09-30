import { execSync } from 'node:child_process'

export default async function globalTeardown() {
  execSync('npm run e2e:fixtures -- down', { stdio: 'inherit', env: process.env })
}
