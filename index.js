const { Telegraf } = require('telegraf')
require('dotenv').config()
const
    API_TOKEN = process.env.BOT_API_TOKEN || '',
    PORT = process.env.PORT || 3000,
    URL = process.env.URL || 'https://mention-bot-telegram.herokuapp.com',
    app = require('express')(),
    bot = new Telegraf(API_TOKEN),
    { post, wrap, Chat, User } = require('./classes'),
    { fdb, init } = require('./fb');

bot.telegram.setWebhook(`${URL}/bot${API_TOKEN}`);
app.use(bot.webhookCallback(`/bot${API_TOKEN}`));

init()

bot.start(ctx => {
    fdb.child('/chats').get().then(snap => {
        const groups = wrap(snap.val())
        let a = 0
        groups.forEach(i => {
            if (i.id != ctx.chat.id) {
                a++
            }
        })
        if (a === groups.length) {
            try {
                post(new Chat(ctx.chat.id.toString()))
                ctx.reply("Hi, I'm a mentioning bot")
            } catch (err) {
                ctx.reply('Try again later')
                console.log(err.message)
            }
        } else {
            ctx.reply('Bot is already started')
        }
    }).catch(err => console.log(err.message))
})

bot.command('help', ctx => {
    ctx.reply(`
        Commands
        /start - start the bot
        /add - add a user to the call-list, usage /add @<username>
        /rm - remove a user from the call-list, usage /rm @<username> or <first_name>
        /all - mention all the users, usage /all <message>
        Text something to add yourself to the call-list
    `)
})

bot.command('all', ctx => {
    let msg = ctx.message.text.split('')
    if (msg[4] !== ' ') {
        msg = ''
    } else {
        msg.splice(0, 4)
        msg = msg.join('')
    }
    fdb.child('/chats').get().then(snap => {
        const groups = wrap(snap.val())
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
        const groups = wrap(snap.val())

        groups.forEach(i => {
            if (i.id === ctx.chat.id.toString()) {
                if (Chat.checkUser(i.members, msg, link)) {
                    try {
                        post(new User(
                            msg,
                            null,
                            link
                        ), `${i.key}/members`)
                        ctx.reply(`User ${msg} was successfully added`)
                    } catch (err) {
                        ctx.reply('Try again later')
                        console.log(err.message)
                    }
                } else {
                    ctx.reply('User already exists in database')
                }
                return
            }
        })
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
        const groups = wrap(snap.val())
        groups.forEach(i => {
            if (i.id === ctx.chat.id.toString()) {
                if (i.members) {
                    if (!Chat.checkUser(i.members, msg, link)) {
                        i.members.forEach(j => {
                            if (j[link] === msg) {
                                fdb.child(`/chats/${i.key}/members/${j.key}`).remove()
                                    .then(() => ctx.reply(`User ${j[link]} was successfully removed`))
                                    .catch(err => {
                                        console.log(err.message)
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
                return
            }
        })
    }).catch(err => console.log(err))
})

bot.on('message', ctx => {
    fdb.child('/chats').get().then(snap => {
        const groups = wrap(snap.val())
        groups.forEach(i => {
            if (i.id === ctx.chat.id.toString()) {
                const link = ctx.message.from.username ? 'username' : 'first_name'
                if (Chat.checkUser(i.members, ctx.message.from[link], link)) {
                    try {
                        post(new User(
                            ctx.message.from[link],
                            ctx.message.from.id.toString(),
                            link
                        ), `${i.key}/members`)
                    } catch (err) {
                        console.log(err.message)
                    }
                }
                return
            }
        })
    }).catch(err => console.log(err.message))
})

bot.launch()
console.log('Bot is launched')

app.get('/wakemydyno.txt', (req, res) => {
    res.sendFile(__dirname + '/wakemydyno.txt')
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});