let token = require('fs').readFileSync('./token.txt')
const { Telegraf } = require('telegraf')
const bot = new Telegraf(token)
// const members = []

// const telegrafGetChatMembers = require('telegraf-getchatmembers')

// bot.use(telegrafGetChatMembers)

bot.start(ctx => {
    ctx.reply('barev xareb')
})
bot.command('/all', ctx => {
    console.log(ctx.message.chat)
})
bot.on('sticker', ctx => {
    ctx.reply('che')
})

bot.launch()
console.log('bot is started')