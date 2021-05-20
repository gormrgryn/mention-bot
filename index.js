const { readFileSync } = require('fs')
const { Telegraf } = require('telegraf')
const axios = require('axios').default
const token = readFileSync('./token.txt')
const dbadress = readFileSync('./dbadress.txt').toString()
const bot = new Telegraf(token)

const { db, Chat, User } = require('./classes.js')

bot.start(ctx => {
    axios.get(`${dbadress}.json`).then(({ data }) => {
        const groups = data ? db.wrap(data) : []
        let a = 0
        groups.forEach(i => {
            if (i.id != ctx.chat.id) {
                a++
            }
        })
        if (a === groups.length) {
            db.post(new Chat(ctx.chat.id.toString()))
            ctx.reply('Hi, Im a mentioning bot')
        } else {
            ctx.reply('Bot is already started')
        }
    }).catch(err => console.log(err))
})

bot.command('all', async ctx => {
    let msg = ctx.message.text.split('')
    if (msg[5] !== ' ') {
        msg = ''
    } else {
        msg.splice(0, 5)
        msg = msg.join('')
    }

    axios.get(`${dbadress}.json`).then(({ data }) => {
        let uns = [], fns = []
        if (!data) {
            return
        }
        const chats = db.wrap(data)
        chats.forEach(chat => {
            if (chat.id === ctx.chat.id.toString()) {
                chat.members.forEach(j => {
                    if (j.username) {
                        uns.push(j.username)
                    }
                    else if (j.first_name) {
                        fns.push(j)
                    }
                })
            }
        })
        let unString = uns.map(i => `@${i}`).join(' ')
        let fnString = fns.map(i => `<a href='tg://user?id=${i.id}'>${i.first_name}</a>`)
        ctx.replyWithHTML(`${msg} ${unString} ${fnString}`)
    }).catch(err => console.log(err))
})

bot.command('add', ctx => {
    let msg = ctx.message.text.split('')
    msg.splice(0, 5)
    if (msg[0] !== '@' || !msg) {
        ctx.reply('Use /add @<username>')
        return
    }
    msg.splice(0, 1)
    msg = msg.join('')
    let link = 'username'
    if (msg) {
        axios.get(`${dbadress}.json`).then(({ data }) => {
            const groups = db.wrap(data)
            groups.forEach(i => {
                if (i.id === ctx.chat.id.toString()) {
                    if (Chat.checkUser(i.members, msg, link)) {
                        db.post(
                            new User(msg, null, link),
                            i.key + '/members'
                        )
                        ctx.reply('User was successfully added')
                    } else {
                        ctx.reply('User already exists in database')
                    }
                }
            })
        })
    }
})

bot.command('rm', ctx => {
    let msg = ctx.message.text.split('')
    msg.splice(0, 4)
    const link = msg[0] === '@' ? 'username' : 'first_name'
    if (msg[0] === '@') msg.splice(0, 1)
    msg = msg.join('')
    axios.get(`${dbadress}.json`).then(({ data }) => {
        const groups = db.wrap(data)
        groups.forEach(i => {
            if (i.id === ctx.chat.id.toString()) {
                if (i.members) {
                    if (!Chat.checkUser(i.members, msg, 'username')) {
                        i.members.forEach(j => {
                            if (j[link] === msg) {
                                axios.delete(
                                    `${dbadress}/${i.key}/members/${j.key}.json`
                                ).then(() => {
                                    ctx.reply(`User ${j[link]} was sucefully removed`)
                                }).catch(err => {
                                    console.log(err)
                                    ctx.reply('Try once again later')
                                })
                            }
                        })
                    } else {
                        ctx.reply('User was not found')
                    }
                } else {
                    ctx.reply('The call-list is empty')
                }
            }
        })
    }).catch(err => console.log(err))
})

bot.on('message', ctx => {
    axios.get(`${dbadress}.json`).then(({ data }) => {
        const groups = db.wrap(data)

        groups.forEach(i => {
            if (i.id === ctx.chat.id.toString()) {
                const link = ctx.message.from.username ? 'username' : 'first_name'
                if (i.members) {
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
                        ), i.key + '/members')
                    }
                } else {
                    db.post(new User(
                        ctx.message.from[link],
                        ctx.message.from.id.toString(),
                        link
                    ), i.key + '/members')
                }
            }
        })
    }).catch(err => console.log(err))
})

bot.launch()
