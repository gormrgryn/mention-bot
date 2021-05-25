const axios = require('axios').default
const dbadress = process.env.DB_ADDRESS

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
        if (!obj) {
            return undefined
        }
        let chats = []
        let keys = Object.keys(obj)
        Object.values(obj).forEach((i, index) => {
            i.key = keys[index]
            chats.push(i)
        })
        chats.forEach(i => {
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
}

class Chat {
    constructor(id) {
        this.id = id
        this.members = []
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
