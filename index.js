const { readFileSync, writeFile } = require('fs')
const { Telegraf } = require('telegraf')
const token = readFileSync('./token.txt')
const bot = new Telegraf(token, { username: 'hameceq_bot' })

const groups = [...JSON.parse(readFileSync('./members.json')).groups]

bot.start(ctx => {
    let a = 0
    groups.forEach(i => {
        if(i.id != ctx.chat.id) {
            a++
        }
    })
    if (a === groups.length || (groups.length === 0 && a === 0)) {
        groups.push({
            id: ctx.chat.id.toString(),
            members: []
        })
        writeFile('./members.json', JSON.stringify({groups}), err => {
            if (err) throw err
        })
        ctx.reply('barev dzez, yes Gagon em')
    } else {
        ctx.reply('Bot is already started')
    }
})

bot.on('message', ctx => {
    if (ctx.message.text === '/all') { // bot.command not working!?
        groups.forEach(i => {
            if (i.id === ctx.chat.id.toString()) {
                ctx.reply(i.members.map(i => `@${i}`).join(' '))
            }
        })
    } else {
        groups.forEach(i => {
            if (i.id === ctx.chat.id.toString() && !i.members.includes(ctx.message.from.username)) {
                i.members.push(ctx.message.from.username)
                writeFile('./members.json', JSON.stringify({groups}), err => {
                    if (err) throw err
                })
            }
        })
        // ctx.replyWithHTML('<a href="tg://user?id=1047907355">Gor</a>')
    }
})

bot.launch()
