const axios = require('axios').default
const dbadress = require('fs').readFileSync('./dbadress.txt').toString()

class db {
    static post(data, url) {
        let address = dbadress
        if (url) {
            address = `${address}/${url}.json`
        } else {
            address = `${address}.json`
        }
        axios.post(address, data).then(() => 200).catch(err => console.log(err))
    }
    static wrap(obj) {
        let chats = []
        let keys = Object.keys(obj)
        Object.values(obj).forEach((i, index) => {
            i.key = keys[index]
            chats.push(i)
        })
        chats.forEach(i => {
            // console.log(i)
            if (i.members) {
                let keys = Object.keys(i.members)
                i.members = Object.values(i.members)
                i.members.map((j, jndex) => {
                    return j.key = keys[jndex]
                })
            }
        })
        return chats
    }
    static async write(path, chats) {
        try {
            await fetch(path, {
                method: 'POST',
                body: JSON.stringify({ chats }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        } catch (err) {
            console.log(err)
        }
    }
}

class Chat {
    constructor(id) {
        this.id = id
        this.members = []
    }
    static generateAll(id) {
        axios.get(`${dbadress}.json`).then(({ data }) => {
            let uns = [], fns = []
            if (!data) {
                return
            }
            const chats = db.wrap(data)
            chats.forEach(chat => {
                if (chat.id == id) {
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
            return unString + ' ' + fnString
        }).catch(err => console.log(err))
    }
    static checkUser(members, user, link) {
        let a = 0
        members.forEach(i => {
            if (i[link] !== user) {
                ++a
            }
        })
        if (a == members.length) return true
        else return false
    }
}

class User {
    constructor(inf, id, link) {
        this.id = id
        this[link] = inf
    }
}

module.exports.db = db
module.exports.Chat = Chat
module.exports.User = User
