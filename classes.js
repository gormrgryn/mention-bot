const { fdb } = require('./fb')

const post = (data, url) => {
    let address = url ? `/chats/${url}` : '/chats'
    fdb.child(address).push(data).catch(err => console.log(err))
}
const wrap = (obj) => {
    if (!obj) {
        return []
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

class Chat {
    constructor(id) {
        this.id = id
        this.members = []
    }
    static checkUser(members, user, link) {
        if (!members) {
            return true
        }
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

module.exports.post = post
module.exports.wrap = wrap
module.exports.Chat = Chat
module.exports.User = User
