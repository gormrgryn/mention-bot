const { readFileSync } = require('fs')
const { Telegraf } = require('telegraf')
const token = readFileSync('./token.txt')
const bot = new Telegraf(token)

const { db, Chat, User } = require('./classes.js')

const groups = db.init('./members.json')

bot.start(ctx => {
    let a = 0
    groups.forEach(i => {
        if (i.id != ctx.chat.id) {
            a++
        }
    })
    if (a === groups.length) {
        groups.push(new Chat(ctx.chat.id.toString()))
        db.write('./members.json', groups)
        ctx.reply('barev dzez, yes Gagon em')
    } else {
        ctx.reply('Bot is already started')
    }
})

bot.command('all', ctx => {
    let msg = ctx.message.text.split('')
    msg.splice(0, 5)
    try {
        ctx.replyWithHTML(msg.join('') + ' ' + Chat.generateAll(ctx.chat.id))
    } catch (err) {
        console.log(err)
    }
})

bot.command('rm', ctx => {
    let msg = ctx.message.text.split('')
    msg.splice(0, 4)
    const link = msg[0] === '@' ? 'username' : 'first_name'
    if (msg[0] === '@') msg.splice(0, 1)
    groups.forEach(i => {
        if (i.id === ctx.chat.id.toString()) {
            i.members.forEach(j => {
                if (j[link] === msg.join('')) {
                    try {
                        i.members.splice(i.members.indexOf(j), 1)
                        ctx.reply(`User ${j[link]} was sucefully removed`)
                        db.write('./members.json', groups)
                    } catch (err) {
                        console.log(err)
                        ctx.reply('Try once again later')
                    }
                }
            })
        }
    })
})

bot.on('message', ctx => {
    groups.forEach(i => {
        if (i.id === ctx.chat.id.toString()) {
            const link = ctx.message.from.username ? 'username' : 'first_name'
            if (!i.members) {
                i.members.push(new User(ctx.message.from[link], ctx.message.from.id.toString(), link))
            } else {
                let a = 0
                i.members.forEach(j => {
                    if (j[link] !== ctx.message.from[link]) {
                        ++a
                    }
                })
                if (a == i.members.length) {
                    i.members.push(new User(ctx.message.from[link], ctx.message.from.id.toString(), link))
                }
            }
            db.write('./members.json', groups)
        }
    })
})

bot.launch()
