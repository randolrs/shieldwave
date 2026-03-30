import { execSync } from 'child_process';
import { readdirSync, existsSync } from 'fs';

console.log('=== cwd ===');
console.log(process.cwd());

console.log('=== root files ===');
console.log(readdirSync('.').join('\n'));

console.log('=== packages/ exists ===');
console.log(existsSync('packages'));

if (existsSync('packages')) {
  console.log('=== packages/ contents ===');
  console.log(readdirSync('packages').join('\n'));
}

console.log('=== packages/frontend exists ===');
console.log(existsSync('packages/frontend'));

if (existsSync('packages/frontend')) {
  console.log('=== packages/frontend contents ===');
  console.log(readdirSync('packages/frontend').join('\n'));
  execSync('cd packages/frontend && npx vite build', { stdio: 'inherit' });
} else {
  console.error('ERROR: packages/frontend not found!');
  process.exit(1);
}
