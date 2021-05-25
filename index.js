const { Telegraf } = require('telegraf')
require('dotenv').config()
const token = process.env.BOT_API_TOKEN
const bot = new Telegraf(token)
const { db, Chat, User } = require('./classes')
const { fdb, init } = require('./fb')

init()

bot.start(ctx => {
    fdb.child('/chats').get().then(snap => {
        const groups = snap.exists() ? db.wrap(snap.val()) : []
        let a = 0
        groups.forEach(i => {
            if (i.id != ctx.chat.id) {
                a++
            }
        })
        if (a === groups.length) {
            try {
                db.post(new Chat(ctx.chat.id.toString()))
                ctx.reply('Hi, Im a mentioning bot')
            } catch (err) {
                ctx.reply('Try again later')
                console.log(err.message)
            }
        } else {
            ctx.reply('Bot is already started')
        }
    }).catch(err => console.log(err.message))
})

bot.command('all', async ctx => {
    let msg = ctx.message.text.split('')
    if (msg[4] !== ' ') {
        msg = ''
    } else {
        msg.splice(0, 4)
        msg = msg.join('')
    }
    fdb.child('/chats').get().then(snap => {
        const groups = snap.exists() ? db.wrap(snap.val()) : []
        let uns = [], fns = []
        if (!groups) {
            return
        }
        groups.forEach(chat => {
            if (chat.id === ctx.chat.id.toString()) {
                if (chat.members) {
                    chat.members.forEach(j => {
                        if (j.username) {
                            uns.push(j.username)
                        }
                        else if (j.first_name) {
                            fns.push(j)
                        }
                    })
                } else {
                    ctx.reply('Call-list is empty')
                    return
                }
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

    fdb.child('/chats').get().then(snap => {
        const groups = snap.exists() ? db.wrap(snap.val()) : []
        if (groups) {
            groups.forEach(i => {
                if (i.id === ctx.chat.id.toString()) {
                    if (i.members) {
                        if (Chat.checkUser(i.members, msg, link)) {
                            try {
                                db.post(new User(
                                    msg,
                                    null,
                                    link
                                ), `${i.key}/members`)
                                ctx.reply('User was successfully added')
                            } catch (err) {
                                ctx.reply('Try again later')
                                console.log(err.message)
                            }
                        } else {
                            ctx.reply('User already exists in database')
                        }
                    } else {
                        try {
                            db.post(new User(
                                msg,
                                null,
                                link
                            ), `${i.key}/members`)
                            ctx.reply('User was successfully added')
                        } catch (err) {
                            ctx.reply('Try again later')
                            console.log(err.message)
                        }
                    }
                }
            })
        } else {
            try {
                db.post(new User(
                    msg,
                    null,
                    link
                ), `${i.key}/members`)
                ctx.reply('User was successfully added')
            } catch (err) {
                ctx.reply('Try again later')
                console.log(err.message)
            }
        }
    }).catch(err => console.log(err.message))
})

bot.command('rm', ctx => {
    let msg = ctx.message.text.split('')
    msg.splice(0, 4)
    if (msg.length == 0) {
        ctx.reply('Use /rm <username or first name>')
        return
    }
    const link = msg[0] === '@' ? 'username' : 'first_name'
    if (msg[0] === '@') msg.splice(0, 1)
    msg = msg.join('')
    fdb.child('/chats').get().then(snap => {
        const groups = snap.exists() ? db.wrap(snap.val()) : []
        groups.forEach(i => {
            if (i.id === ctx.chat.id.toString()) {
                if (i.members) {
                    if (!Chat.checkUser(i.members, msg, 'username')) {
                        i.members.forEach(j => {
                            if (j[link] === msg) {
                                fdb.child(`/chats/${i.key}/members/${j.key}`).remove()
                                    .then(() => ctx.reply(`User ${j[link]} was sucefully removed`))
                                    .catch(err => {
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
    fdb.child('/chats').get().then(snap => {
        const groups = db.wrap(snap.val())
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
                        try {
                            db.post(new User(
                                ctx.message.from[link],
                                ctx.message.from.id.toString(),
                                link
                            ), `${i.key}/members`)
                        } catch (err) {
                            ctx.reply('Try again later')
                            console.log(err.message)
                        }
                    }
                } else {
                    try {
                        db.post(new User(
                            ctx.message.from[link],
                            ctx.message.from.id.toString(),
                            link
                        ), `${i.key}/members`)
                    } catch (err) {
                        ctx.reply('Try again later')
                        console.log(err.message)
                    }
                }
            }
        })
    }).catch(err => console.log(err.message))
})

bot.launch()
console.log('sax lawa')