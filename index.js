const { readFileSync, writeFile } = require('fs')
const token = readFileSync('./token.txt')
const { Telegraf } = require('telegraf')
const bot = new Telegraf(token)
const groups = [...JSON.parse(readFileSync('./members.json')).groups]

bot.start(ctx => {
    ctx.reply('barev dzez, yes Gagon em')
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
    } else {
        console.log('qez chisht pahi')
    }
})






// bot.command('/all', ctx => {
//     ctx.reply(members.map(i => `@${i}`).join(' '))
// })
// bot.on('text', ctx => {
//     console.log(ctx.message.chat)
//     let i = ctx.message.from.username
//     if (members.includes(i)) {
//         return
//     }
//     members.push(i)
//     console.log(members)
    
// })
// bot.command('/test', ctx => {
//     console.log(ctx.chat)
// })



bot.launch()