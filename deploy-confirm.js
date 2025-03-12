const readline = require('readline');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ensure 404.html exists
const ensure404Page = () => {
  const file404Path = path.join(__dirname, 'public', '404.html');
  if (!fs.existsSync(file404Path)) {
    console.log('Creating 404.html for GitHub Pages SPA routing...');
    const content = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');
    fs.writeFileSync(file404Path, content);
  }
};

// Ensure .nojekyll file exists in build directory
const ensureNojekyll = () => {
  const buildDir = path.join(__dirname, 'build');
  const nojekyllPath = path.join(buildDir, '.nojekyll');
  
  if (!fs.existsSync(nojekyllPath)) {
    console.log('Creating .nojekyll file in build directory...');
    fs.writeFileSync(nojekyllPath, '');
  }
};

rl.question('Are you sure you want to deploy to GitHub Pages? (y/n): ', (answer) => {
  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    console.log('Starting deployment to GitHub Pages...');
    try {
      // Make sure 404.html exists
      ensure404Page();
      
      // Build the app
      console.log('Building the application...');
      execSync('npm run predeploy', { stdio: 'inherit' });
      
      // Ensure .nojekyll file is in build directory
      ensureNojekyll();
      
      // Deploy to GitHub Pages
      console.log('Deploying to GitHub Pages...');
      execSync('gh-pages -d build', { stdio: 'inherit' });
      
      console.log('Deployment successful!');
      console.log('Note: It may take a few minutes for changes to appear on GitHub Pages.');
    } catch (error) {
      console.error('Deployment failed:', error);
    }
  } else {
    console.log('Deployment canceled.');
  }
  rl.close();
}); 