import { chromium, type FullConfig } from '@playwright/test';

const fs = require('fs').promises;
const filePath = '.auth/user.json';

async function browserAuthorize(config: FullConfig){
    const { baseURL, storageState } = config.projects[0].use;
   
    let user: any;
    try {
        const data = await fs.readFile(filePath);
        user = JSON.parse(data);
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.log('User auth file does not exist, creating new file');
            user = { cookies: [], origins: [] };
            await fs.writeFile(filePath, JSON.stringify(user, null, 2));
        } else {
            console.error('Error processing user.json file:', err);
            throw err;
        }
    }

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    await context.addCookies(user.cookies)
    const page = await context.newPage();

    console.log(`\x1b[2m\tSign in started to '${baseURL}'\x1b[0m`);

    await page.goto(baseURL!)
    if(await page.locator('.login').isVisible()){
        await page.locator('#username').fill(process.env.EMAIL)
        await page.locator('#password').fill(process.env.PASSWORD)
        await page.getByRole('button', { name: 'Continue' }).click()
    }
    const tokenResponse = await page.waitForResponse("**/token")
    const responeJsonBody = await tokenResponse.json()
    const accessToken = responeJsonBody.access_token
    process.env['ACCESS_TOKEN'] = accessToken

    console.log(`\x1b[2m\tSign in processed\x1b[0m`);

    await page.context().storageState({ path: storageState as string });
    await browser.close();
}

export default browserAuthorize;