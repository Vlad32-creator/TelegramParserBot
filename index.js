import dotenv from "dotenv";
dotenv.config()
import TelegramBot from "node-telegram-bot-api";
import parsText from "./parsing.js";
import express from 'express';

const TOKEN = process.env.BOTTOKEN;
const PORT = process.env.PORT||5000;
const bot = new TelegramBot(TOKEN, { webHook: true });
const url = 'https://telegramparserbot-1.onrender.com';
const app = express();

bot.setWebHook(`${url}/bot${TOKEN}`);

app.use(express.json());
app.post(`/bot${TOKEN}`, (req,res) => {
    bot.processUpdate(req.body);
    res.status(200);
})
app.listen(PORT , () => {
    console.log(`Server work on ${PORT}`);
})

bot.setMyCommands([
    { command: 'pravdanews', description: 'Правда News' },
    { command: 'nbunews', description: 'Новости НБУ' },
    { command: 'nbuin', description: 'Важные показатели НБУ' },
    { command: 'fjs', description: 'Заказы на JS,TS заказы' },
    { command: 'fweb', description: 'Заказы на веб програмирывание' },
    { command: 'fhtml', description: 'Заказы на верстку' },
    { command: 'custom', description: 'Кастомный запрос' }
])

bot.onText(/\/start/, async msg => {
    const id = msg.chat.id;
    bot.sendMessage('I work on it...');
    const text = 'url:https://example.com;data:[h1,text];'
    const res = await parsText(text);
    res.forEach(it => {
        if (it.success) {
            if (Array.isArray(it.success)) {
                bot.sendMessage(id, it.success[0]);
            }
            bot.sendMessage(id, it.success);
        } else {
            bot.sendMessage(id, it.Error);
        }
    })
})

bot.onText(/\/pravdanews/, async ms => {
    const id = ms.chat.id;
    bot.sendMessage(id, "I am working on it...");
    try {
        const text = 'url:https://www.pravda.com.ua/news/;wait:1000;click:#mode2;data:[.section_header_date,text];alldata:[.article_news_bold,text];'
        const res = await parsText(text);
        console.log(res);
        try {
            res.forEach(it => {
                if (!it) return; 
                if (it.success) {
                    if (Array.isArray(it.success)) {
                        for (const i in it.success) {
                            bot.sendMessage(id, it.success[i]);
                        }
                    }
                    try {
                        bot.sendMessage(id, it.success);
                    } catch (err) {
                        console.log(err);
                        bot.sendMessage(id,"Som thing went wrong");
                    }
                } else {
                    bot.sendMessage(id, it.Error);
                }
            });
        } catch (err) {
            console.log(err);
            bot.sendMessage('Function return undefined');
        }
    } catch (err) {
        console.log(err);
        bot.sendMessage(id, 'Som thing went wrong');
    }
})

bot.onText(/\/nbunews/, async ms => {
    const id = ms.chat.id;
    bot.sendMessage(id, 'I am work on it...');
    try {
        const text = 'url:https://bank.gov.ua/;alldata:[.collection-item .content p,text];alldata:[.collection-item .content p a,href];';
        const res = await parsText(text);
        res.forEach(it => {
            if (it.success) {
                if (Array.isArray(it.success)) {
                    for (const i in it.success) {
                        bot.sendMessage(id, it.success[i]);
                    }
                }
                bot.sendMessage(id, it.success);
            } else {
                bot.sendMessage(id, it.Error);
            }
        });
    } catch (err) {
        console.log('Som thing went wrong');
        bot.sendMessage(id, 'Som thing went wrong');
    }
})

bot.onText(/\/nbuin/, async ms => {
    const id = ms.chat.id;
    bot.sendMessage(id, 'I am work on it...');
    try {
        const text = 'url:https://bank.gov.ua/;alldata:[#container-3 .collection-item ,text];';
        const res = await parsText(text);
        res.forEach(it => {
            if (it.success) {
                if (Array.isArray(it.success)) {
                    for (const i in it.success) {
                        bot.sendMessage(id, it.success[i]);
                    }
                }
                bot.sendMessage(id, it.success);
            } else {
                bot.sendMessage(id, it.Error);
            }
        });
    } catch (err) {
        console.log('Som thing went wrong');
        bot.sendMessage(id, 'Som thing went wrong');
    }
})
bot.onText(/\/fhtml/, async ms => {
    const id = ms.chat.id;
    bot.sendMessage(id, "I am work on it...")
    try {
        const text = "url:https://freelancehunt.com/ua/projects/skill/html-ta-css-verstannya/124.html?_gl=1*g3wu9z*_up*MQ..*_gs*MQ..&gclid=Cj0KCQjw58PGBhCkARIsADbDilyoEFb1iTogMWmJ6RT6O_Iu-X5rey79Gsx33ru3NSi-T4sPLDXsPLMaAiWREALw_wcB&gbraid=0AAAAAodmEELDPzmLmNA3gpg0NaACEZIrA;alldata:[.left,text];"
        const res = await parsText(text);
        bot.sendMessage(id, 'HTML,CSS...')
        res.forEach(it => {
            if (it.success) {
                if (Array.isArray(it.success)) {
                    for (const i in it.success) {
                        bot.sendMessage(id, it.success[i]);
                    }
                }
                bot.sendMessage(id, it.success);
            } else {
                bot.sendMessage(id, it.Error);
            }
        })
    } catch (err) {
        console.log('Som thing went wrong');
        bot.sendMessage(id, 'Som thing went wrong');
    }
})
bot.onText(/\/fweb/, async ms => {
    const id = ms.chat.id;
    bot.sendMessage(id, "I work on it...");
    try {
        const text = "url:https://freelancehunt.com/ua/projects/skill/veb-programuvannya/99.html?_gl=1*xqanbd*_up*MQ..*_gs*MQ..&gclid=Cj0KCQjw58PGBhCkARIsADbDilyoEFb1iTogMWmJ6RT6O_Iu-X5rey79Gsx33ru3NSi-T4sPLDXsPLMaAiWREALw_wcB&gbraid=0AAAAAodmEELDPzmLmNA3gpg0NaACEZIrA;alldata:[.left,text];"
        const res = await parsText(text);
        bot.sendMessage(id, 'Web Програмування...')
        res.forEach(it => {
            if (it.success) {
                if (Array.isArray(it.success)) {
                    for (const i in it.success) {
                        bot.sendMessage(id, it.success[i]);
                    }
                }
                bot.sendMessage(id, it.success);
            } else {
                bot.sendMessage(id, it.Error);
            }
        })
    } catch (err) {
        console.log('Som thing went wrong');
        bot.sendMessage(id, 'Som thing went wrong');
    }
})
bot.onText(/\/fjs/, async ms => {
    const id = ms.chat.id;
    bot.sendMessage(id, "I work on it...")
    try {
        const text = 'url:https://freelancehunt.com/ua/projects/skill/javascript/28.html?_gl=1*ztrywq*_up*MQ..*_gs*MQ..&gclid=CjwKCAjwisnGBhAXEiwA0zEOR3JHred-pV0esxQ8TwNzU640-7S7_wwtm1-R4kbotRO8DRNm49rUeRoCWtAQAvD_BwE&gbraid=0AAAAAodmEELPYCItsSxCoOPwblp-UllIy;alldata:[.left,text];'
        const res = await parsText(text);
        bot.sendMessage(id, 'JavaScript,TypeScript...');
        res.forEach(it => {
            if (it.success) {
                if (Array.isArray(it.success)) {
                    for (const i in it.success) {
                        bot.sendMessage(id, it.success[i]);
                    }
                }
                bot.sendMessage(id, it.success);
            } else {
                bot.sendMessage(id, it.Error);
            }
        })
    } catch (err) {
        console.log('Som thing went wrong');
        bot.sendMessage(id, 'Som thing went wrong');
    }
})
bot.onText(/\/custom/, async (msg) => {
    const id = msg.chat.id;
    bot.sendMessage(id, 'Enter your data...');
    bot.once('message', async (ms) => {
        const exceptions = [null, undefined, NaN, '', ' '];
        bot.sendMessage(id, "I work on it...")
        const res = await parsText(ms.text);
        // console.log(res);
        if (exceptions.includes(res)) {
            bot.sendMessage(id, 'Function return nothing');
            console.log("Function return nothing");
            return;
        }
        try {
            res.forEach(it => {
                try {
                    if (it.success) {
                        if (Array.isArray(it.success)) {
                            for (const i in it.success) {
                                bot.sendMessage(id, it.success[i]);
                            }
                        }
                        bot.sendMessage(id, it.success);
                    } else {
                        bot.sendMessage(id, it.Error);
                    }
                } catch (err) {
                    console.log(err);
                }
            })
        } catch (err) {
            bot.sendMessage(id, 'Was Error')
            console.log(err);

        }
    })
})

console.log("Bot work success");
