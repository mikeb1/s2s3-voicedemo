import { createTool } from '@mastra/core/tools';
import chalk from 'chalk';
import { chromium } from 'playwright-core';
import { z } from 'zod';
import fs from 'fs';

export const browserTool = createTool({
  id: 'browserTool',
  // name: 'Browser Tool',
  description: 'Browser Tool, opens a browser and navigates to a url capturing the content',
  inputSchema: z.object({
    url: z.string(),
  }),
  outputSchema: z.object({
    message: z.string(),
  }),
  execute: async ({ context: { url } }) => {
    try {
      const browser = await chromium.launch({
        headless: true,
      });

      const page = await browser.newPage();

      console.log(chalk.blue('Navigating to URL...'), url); 
      await page.goto(
        url,
        // { waitUntil: 'networkidle' }
      );

      console.log(chalk.blue('Navigated'));

      const content = await page.innerText('body');
      console.log(chalk.blue('Captured content...'));
      const output = await page.screenshot()

      fs.writeFileSync('output/screenshot.png', output);

      await page.close();
      await browser.close();

      return { message: content };
    } catch (e) {
      console.log(e);
      if (e instanceof Error) {
        console.log(`\n${chalk.red(e.message)}`);
        return { message: `Error: ${e.message}` };
      }

      return { message: 'Error' };
    }
  },
});

export const googleSearch = createTool({
  id: 'googleSearch',
  // name: 'Google Search',
  description: 'Google Search. Passes the query to Google and returns the search results.',
  inputSchema: z.object({
    query: z.string(),
  }),
  outputSchema: z.object({
    message: z.string(),
  }),
  execute: async ({ context: { query } }) => {
    let browser;
    try {
      browser = await chromium.launch({
        headless: true,
      });
    } catch (e) {
      if (e instanceof Error) {
        console.log(`\n${chalk.red(e.message)}`);
        return { message: `Error: ${e.message}` };
      }
      return { message: 'Error' };
    }

    try {
      const page = await browser.newPage();
      await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`);

      console.log(`\n`);
      console.log(chalk.blue('Waiting for search results...'), query);

      try {
        await page.click('button:has-text("Accept all")', { timeout: 5000 });
      } catch (e) {
        // Cookie dialog didn't appear, continue
      }
      // Wait for results and click first organic result
      await page.waitForSelector('#search');

      const text = await page.evaluate(() => {
        const links: string[] = [];
        const searchResults = document.querySelectorAll('div.g a');

        searchResults.forEach(link => {
          const href = link.getAttribute('href');
          if (href && href.startsWith('http')) {
            links.push(href);
          }
        });

        return links;
      });

      await page.close();
      await browser.close();

      if (!text.length) {
        return { message: 'No results' };
      }

      return { message: text.join('\n') };
    } catch (e) {
      if (e instanceof Error) {
        console.log(`\n${chalk.red(e.message)}`);
        return { message: `Error: ${e.message}` };
      }
      return { message: `Error` };
    }
  },
});
