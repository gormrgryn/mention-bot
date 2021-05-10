const {writeFile, readFileSync} = require('fs')

class db {
    static init(path) {
        try {
            return [...JSON.parse(readFileSync(path)).groups]
        } catch (err) {
            writeFile(path, '{ "groups": [] }', err => {
                if (err) throw err
            })
            return []
        }
    }
    static write(path, groups) {
        writeFile(path, JSON.stringify({groups}), err => {
            if (err) throw err
        }) 
    }
}

class Chat {
    constructor(id) {
        this.id = id
        this.members = []
    }
    static generateAll(id) {
        const groups = db.init('./members.json')
        let uns = [], fns = []
        groups.forEach(chat => {
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