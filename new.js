const puppeteer = require('puppeteer');

(async () => {
  // Launch the browser
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Navigate to the page
  await page.goto('https://www.nseindia.com/market-data/pre-open-market-cm-and-emerge-market', { waitUntil: 'networkidle2' });

  // Variable to store the download URL
  let downloadUrl = null;

  // Intercept network requests
  page.on('request', request => {
    console.log('Request URL:', request.url());
    // Check if the request is for a .csv file
    if (request.url().endsWith('.csv')) {
      downloadUrl = request.url();
    }
  });

  // Scroll the page to ensure download link is visible
  await page.evaluate(() => {
    // Replace 'YOUR_SELECTOR' with the selector of the element that triggers the download
    const element = document.querySelector('a[href="javascript:;"]');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }
  });

  // Inject code to trigger the download function
  await page.evaluate(() => {
    // Click the download link
    document.querySelector('a[href="javascript:;"]').click();
  });

  // Wait for a short time to ensure the request is captured
  await page.waitForRequest(request => request.url().endsWith('.csv'));

  // Print the captured download URL
  console.log('Extracted URL:', downloadUrl);

  // Close the browser
  await browser.close();
})();
