require('dotenv').config()
const Telegraf = require(`telegraf`)
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const { markdown } = require('telegraf/extra')

const { BOT_TOKEN, URL } = process.env
const PORT = process.env.PORT || 5000
const bot = new Telegraf(BOT_TOKEN)

// bot.use(Telegraf.log())

// Register logger middleware
bot.use((ctx, next) => {
	const start = new Date()
	return next().then(() => {
		const ms = new Date() - start
		console.log('response time %sms', ms)
	})
})

bot.command('env', (ctx) => {
	ctx.reply(`ENV is ${process.env.NODE_ENV}`)
})

const WA_EXAMPLE = '+79371234567'
const PHONE = /^(\s*)?(\+)?([- _():=+]?\d[- _():=+]?){10,14}(\s*)?$/

bot.start((ctx) => ctx.reply('Пришли телефончик, я его ватсапну)'))

bot.help((ctx) => {
	return ctx.replyWithHTML(`<b>Номер телефона в любом формате</b>
	
	Например: ${WA_EXAMPLE}
	<i>(достаточно скопировать и отправить.)</i> 
	<b>Внимание телефон ненастоящий</b>
	
	В ответ бот пришлет ссылку на переписку в ватсапе. Достаточно кликнуть на ссылку`,
		{ disable_web_page_preview: true }
	)
})

bot.action('helpme', (ctx, next) => {
	return showLink(ctx, WA_EXAMPLE).then(() => next())
})

bot.hears(PHONE, async ctx => {
	const text = ctx.message.text;
	let tel = text.replace(/\D/g, '');

	if (tel[0] == '8') 
		tel = tel.replace('8', '7')
	showLink(ctx, tel)
});

function showLink(ctx, tel) {
	try {
		const link = `https://wa.me/` + tel;

		return ctx.reply(link, { disable_web_page_preview: true })
	} catch (error) {
		return ctx.reply(error);
	}
}


bot.on('message', (ctx) => ctx.reply("Кушаю только номер телефона. Пример: /help"))

if (process.env.NODE_ENV === 'production') {
	bot.telegram.setWebhook(`${URL}/bot${BOT_TOKEN}`)
	bot.startWebhook(`/bot${BOT_TOKEN}`, null, PORT)
	console.log('Started with webhook')
} else {
	bot
		.launch()
		.then((res) => console.log(`Launched at ${new Date()}`))
		.catch((err) => console.log(`ERROR at launch:`, err))
}