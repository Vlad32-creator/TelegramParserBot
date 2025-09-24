import { chromium } from 'playwright';


const commands = {
    url: (data, stack) => {
        if (typeof data !== 'string') {
            throw new Error('Ожидался строковый URL');
        }
        console.log('[Команда URL] Установлен адрес:', data);
    },
    click: (data, stack) => stack.push({ click: data }),
    data: (data, stack) => stack.push({ data: data }),
    screenshot: (data, stack, screen) => {
        if (data === 'true') {
            screen.value = true;
            console.log('screenshot: ' + screen);
        } else {
            screen.value = false;
            console.log('screenshot: ' + screen);
        }
    },
    wait: (data, stack) => {
        if (!isNaN(Number(data))) {
            Number(data) > 2000? stack.push({ wait: 1000 }) : stack.push({ wait: Number(data) });
        } else {
            throw new Error('In Wait not Number');
        }
    },
    input: (data, stack) => stack.push({ input: data }),
    alldata: (data, stack) => stack.push({ alldata: data }),
}

function func() {
    return {
        input: async (page, data) => {
            try {
                await page.waitForSelector(data[0]);
            } catch (err) {
                if (err.name === 'TimeoutError') {
                    return { Error: `Element ${data} not found` };
                }
            }
            await page.type(data[0], data[1]);
            console.log('Function input');
        },
        wait: async (page, ms) => {
            console.log('Function wait');
            await new Promise(resolve => setTimeout(resolve, ms));
        },
        click: async (page, data) => {
            try {
                await page.waitForSelector(data);
            } catch (err) {
                if (err.name === 'TimeoutError') {
                    return { Error: `Element ${data} not found` };
                }
            }
            // await safeClick(page, data);
            await page.click(data);
            console.log('Function click');
        },
        data: async (page, data) => {
            try {
                const attr = ['href','src','class','id','style','title','data','target','name','value'];
                console.log('Function data');
                const [select, wot] = data;
                try {
                    await page.waitForSelector(select);
                } catch (err) {
                    if (err.name === 'TimeoutError') {
                        return { Error: `Element ${data[0]} not found` };
                    }
                }
                if (wot === 'text') {
                    return { success: await page.$eval(select, el => el.textContent.trim()) };
                } if (attr.includes(wot)) {
                    return { success: await page.$eval(select, (el, wot) => el.getAttribute(wot), wot) };
                } if (wot === 'html') {
                    return { success: await page.$eval(select, el => el.innerHTML) };
                } if (wot === 'Style') {
                    const style = await page.$eval(select, el => {
                        const computed = window.getComputedStyle(el);
                        const result = {};
                        for (let i = 0; i < computed.length; i++) {
                            const prop = computed[i];
                            result[prop] = computed.getPropertyValue(prop);
                        }
                        return result;
                    })
                    console.log(style);
                    return { success: style };
                }
                return { Error: `Enter second part in array ${data[0]}` };
            } catch (err) {
                if (err.name === 'TimeoutError') {
                    return { Error: `Element ${data[0]} not found` };
                }
            }
        },
        alldata: async (page, data) => {
            try {
                console.log('Function alldata');
                console.log(data);
                const attr = ['href','src','class','id','style','title','data','target','name','value'];
                const [select, wot] = data;
                try {
                    console.log(select);
                    await page.waitForSelector(select);
                } catch (err) {
                    console.log(err);
                    if (err.name === 'TimeoutError') {
                        return { Error: `Element ${data[0]} not found` };
                    }
                }
                console.log(wot);
                if (wot === 'text') {
                    console.log('text');
                    return {
                        success: await page.$$eval(select, els =>
                            els.map(el => el.textContent.trim()
                        ))
                    };
                } if (attr.includes(wot)) {
                    console.log('attr');
                    return {
                        success: await page.$$eval(select, (els, attr) =>
                            els.map(el => el.getAttribute(attr)
                            ), wot)
                    }
                } if (wot === 'html') {
                    console.log('html');
                    return {
                        success: await page.$$eval(select, els =>
                            els.map(el => el.innerHTML)
                        )
                    }
                } if (wot === 'Style') {
                    return {
                        success: await page.$$eval(select, els =>
                            els.map(el => {
                                const computed = window.getComputedStyle(el)
                                const result = {};
                                for (let i = 0; i < computed.length; i++) {
                                    const prop = computed[i];
                                    result[prop] = computed.getPropertyValue(prop);
                                }
                                return result;
                            })
                        )
                    }
                }
                return { Error: `Enter second part in array ${data[0]}` };
            } catch (err) {
                if (err.name === 'TimeoutError') {
                    return { Error: `Element ${data[0]} not found` };
                }
            }
        }
    }
}

async function main(stack, url, screenshot) {
    try {
        const answer = [];
        let browser, page;
        try {
            browser = await chromium.launch({
                headless: true,
                args: ['--no-sandbox'],
            });
        } catch (err) {
            console.error('Browser Error:', err);
            return [{Error: 'Server error Browser not wort'}];
        }
        try {
            page = await browser.newPage();
            await page.goto(url, { waitUntil: 'domcontentloaded' });
            //networkidle0
        } catch (err) {
            console.log('Error: ',err);
            await browser.close();
            return [{ Error: 'NOT VALID URL. check url' }];
        }
        for (let i = 0; i < stack.length; i++) {
            const waitFor = stack[i + 1] ? Object.values(stack[i + 1])[0] : 'none';
            answer.push(await func()[Object.keys(stack[i])](page, ...Object.values(stack[i]), waitFor, answer));
        }
        console.log("screenshot: " + screenshot.value);

        if (screenshot.value) {
            answer.push({screenshot: await page.screenshot()});
            console.log('screenshot: ' + screenshot.value);
        }
        await browser.close();
        return answer;
    } catch (err) {
        if (err.name === 'TimeoutError') {
            console.log(err);
        }
        console.log(err);
        browser.close();
        return {Error: err};
    }
}

async function parsText(text){
    if (!text) {
        console.log('text is required argument');
        return;
    }
    const stack = [];
    let url = '';
    const screenshot = {value: false};
    const exceptions = [null,undefined,NaN,'',' '];
    const texts = text.split(';');
    console.log(texts);
    
    for (const t in texts) {
        const key = texts[t].slice(0,texts[t].indexOf(':')).trim();
        const value = texts[t].slice(texts[t].indexOf(':')+1).trim();
        if (exceptions.includes(key)|exceptions.includes(value)) {
            console.log('exceptions');
            continue;
        }if (key === 'url') {
            url = value;
        }
        console.log('key:',key);
        console.log('value:',value);
        try {
            commands[key && key](checkArray(value),stack,screenshot)
        } catch (err) {
            console.log(`Unexpected syntax in ${key}:${value}`);
            return (`Unexpected syntax in ${key}:${value}`);
        }
    }
    return await main(stack,url,screenshot);
}

function checkArray(text){ 
    if (text.startsWith('[') && text.endsWith(']')) {
        let t = text.slice(1,-1);
        t = t.trim();
        return t.split(',').map(it => it.trim());
    }else{
        return text
    }
}
export default parsText;