const { readFileSync, writeFile } = require('fs')
const token = readFileSync('./token.txt')
const { Telegraf } = require('telegraf')
const bot = new Telegraf(token)
const members = [...JSON.parse(readFileSync('./members.json')).members]

bot.start(ctx => {
    ctx.reply('barev xareb')
})
bot.command('/all', ctx => {
    ctx.reply(members.map(i => `@${i}`).join(' '))

})
bot.on('text', ctx => {
    members.push(ctx.message.from.username)
    writeFile('./members.json', JSON.stringify({members}), err => {
        if (err) throw err
    })
})

bot.launch()