const { spawn } = require('child_process');

process.env.DATABASE_URL = 'postgresql://dummy:dummy@localhost:5432/dummy';

const prisma = spawn('npx', ['prisma', 'generate'], {
  stdio: 'inherit',
  shell: true
});

prisma.on('close', (code) => {
  if (code !== 0) {
    process.exit(code);
  }
});
