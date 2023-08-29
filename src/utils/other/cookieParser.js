const path = require('node:path');
const fs = require('node:fs');
const cookies = require(path.resolve('./cookies.json'));

try {
    const cookieString = cookies
        .map(({ name, value }) => {
            return `${name}=${value}`;
        })
        .join('; ');

    fs.writeFile(path.resolve('./cookies.txt'), cookieString, () => {
        return process.exit(0);
    });
} catch (error) {
    process.exit(1);
}
