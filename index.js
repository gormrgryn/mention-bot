const { readFileSync } = require('fs')
const { Telegraf } = require('telegraf')
const axios = require('axios').default
const token = readFileSync('./token.txt')
const dbadress = readFileSync('./dbadress.txt').toString()
const bot = new Telegraf(token)

const { db, Chat, User } = require('./classes.js')

bot.start(ctx => {
    axios.get(`${dbadress}.json`).then(res => {
        const groups = res.data ? Object.values(res.data) : []
        let a = 0
        groups.forEach(i => {
            if (i.id != ctx.chat.id) {
                a++
            }
        })
        if (a === groups.length) {
            axios.post(dbadress, new Chat(ctx.chat.id.toString()))
                .then(() => ctx.reply('barev dzez, yes Gagon em'))
                .catch(err => console.log(err))
        } else {
            ctx.reply('Bot is already started')
        }
    }).catch(err => console.log(err))
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

bot.command('add', ctx => {
    let msg = ctx.message.text.split('')
    msg.splice(0, 5)
    msg = msg.join('')
    let link = 'username'
    if (msg) {
        groups.forEach(i => {
            if (i.id === ctx.chat.id.toString()) {
                if (Chat.checkUser(i.members, msg, link)) {
                    i.members.push(new User(msg, null, link))
                    ctx.reply('User was successfully added')
                } else {
                    ctx.reply('User already exists in database')
                }
            }
        })
        db.write(dbadress, groups)
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
                        db.write(dbadress, groups)
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
    axios.get(`${dbadress}.json`).then(res => {
        const groups = db.wrap(Object.values(res.data))
        console.log(groups)
        const keys = Object.keys(res.data)

        groups.forEach((i, index) => {
            if (i.id === ctx.chat.id.toString()) {
                const link = ctx.message.from.username ? 'username' : 'first_name'
                if (i.members) {
                    console.log(i.members)
                    let a = 0
                    i.members.forEach(j => {
                        if (j[link] !== ctx.message.from[link]) {
                            ++a
                        }
                    })
                    if (a == i.members.length) {
                        db.post(new User(
                            ctx.message.from[link],
                            ctx.message.from.id.toString(),
                            link
                        ), keys[index] + '/members')
                    }
                } else {
                    db.post(new User(
                        ctx.message.from[link],
                        ctx.message.from.id.toString(),
                        link
                    ), keys[index] + '/members')
                }
            }
        })
    }).catch(err => console.log(err))
})

// axios.get(`${dbadress}.json`).then(res => {
//     let chats = Object.values(res.data)
//     chats.map(i => {
//         if (Object.keys(i)[1] == 'members') {
//             return i.members = Object.values(i.members)
//         }
//     })
//     console.log(chats[0].members)
// })

bot.launch()