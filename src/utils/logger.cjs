const chalk = require('chalk');

module.exports = (req, res, next) => {
  const currentDate = new Date().toISOString();
  console.log(chalk.blue(`[${currentDate}]`), chalk.green(req.method), chalk.yellow(req.url));

  // Check if the request body is already parsed
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(chalk.magenta('Body:'), req.body);
  } else {
    // Manually parse the request body if not already parsed
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      if (body) {
        try {
          const parsedBody = JSON.parse(body);
          console.log(chalk.magenta('Body:'), parsedBody);
        } catch (error) {
          console.log(chalk.red('Failed to parse body'), body);
        }
      }
      next();
    });
    return;
  }

  next();
};
