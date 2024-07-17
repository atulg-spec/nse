const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const csv = require('csv-parser');

const filesFolder = './files';
const concurrency = 5; // Number of concurrent page visits

const visitUrlsFromCsv = async (filePath) => {
  return new Promise((resolve, reject) => {
    const urls = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        if (row.URL && !row.URL.endsWith('.pdf')) {
          urls.push(row.URL);
        }
      })
      .on('end', async () => {
        const browser = await puppeteer.launch({ headless: false });
        const pagePool = Array(concurrency).fill().map(() => browser.newPage());

        const visitUrl = async (page, url) => {
          try {
            await page.goto(url, { waitUntil: 'networkidle2' });
            console.log(`Visited: ${url}`);
          } catch (err) {
            console.error(`Error visiting ${url}: ${err.message}`);
          }
        };

        const urlChunks = Array.from({ length: Math.ceil(urls.length / concurrency) }, (_, i) =>
          urls.slice(i * concurrency, i * concurrency + concurrency)
        );

        for (const chunk of urlChunks) {
          await Promise.all(chunk.map((url, index) => visitUrl(pagePool[index], url)));
        }

        await Promise.all(pagePool.map(page => page.then(p => p.close())));
        await browser.close();
        resolve();
      })
      .on('error', reject);
  });
};

const visitAllUrls = async () => {
  fs.readdir(filesFolder, async (err, files) => {
    if (err) {
      console.error(`Error reading directory: ${err.message}`);
      return;
    }

    for (const file of files) {
      if (path.extname(file) === '.csv') {
        const filePath = path.join(filesFolder, file);
        console.log(`Processing file: ${filePath}`);
        await visitUrlsFromCsv(filePath);
      }
    }

    console.log('All URLs visited.');
  });
};

visitAllUrls().catch(console.error);
