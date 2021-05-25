const { Telegraf } = require('telegraf')
require('dotenv').config()
const token = process.env.BOT_API_TOKEN
const bot = new Telegraf(token)
const firebase = require('firebase')
const { db, Chat, User } = require('./classes.js')

const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    databaseURL: process.env.DB_URL,
    projectId: "mention-bot-telegram",
    storageBucket: "mention-bot-telegram.appspot.com",
    messagingSenderId: process.env.messagingSenderId,
    appId: process.env.APP_ID,
    measurementId: process.env.measurementId
}

firebase.initializeApp(firebaseConfig)

const email = "margaryan.gor.55@gmail.com";
const password = process.env.PASS;

const bla = async () => {
    await firebase.auth().signInWithEmailAndPassword(email, password)
    console.log(firebase.auth().currentUser.uid)
}
bla()

const fdb = firebase.database().ref()

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
            fdb.child('/chats').push(new Chat(ctx.chat.id.toString()))
                .then(() => {
                    ctx.reply('Hi, Im a mentioning bot')
                }).catch(err => {
                    ctx.reply('Try again later')
                    console.log(err.message)
                })
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
                            fdb.child(`/chats/${i.key}/members`).push(new User(
                                msg,
                                null,
                                link
                            )).then(() => {
                                ctx.reply('User was successfully added')
                            }).catch(err => {
                                ctx.reply('Try again later')
                                console.log(err.message)
                            })
                        } else {
                            ctx.reply('User already exists in database')
                        }
                    } else {
                        fdb.child(`/chats/${i.key}/members`).push(new User(
                            msg,
                            null,
                            link
                        )).then(() => {
                            ctx.reply('User was successfully added')
                        }).catch(err => {
                            ctx.reply('Try again later')
                            console.log(err.message)
                        })
                    }
                }
            })
        } else {
            fdb.child(`/chats/${i.key}/members`).push(new User(
                msg,
                null,
                link
            )).then(() => {
                ctx.reply('User was successfully added')
            }).catch(err => {
                ctx.reply('Try again later')
                console.log(err.message)
            })
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
                        fdb.child(`/chats/${i.key}/members`).push(new User(
                            ctx.message.from[link],
                            ctx.message.from.id.toString(),
                            link
                        ))
                    }
                } else {
                    fdb.child(`/chats/${i.key}/members`).push(new User(
                        ctx.message.from[link],
                        ctx.message.from.id.toString(),
                        link
                    ))
                }
            }
        })
    }).catch(err => console.log(err.message))
})

bot.launch()
console.log('sax lawa')