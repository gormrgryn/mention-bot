const axios = require('axios').default
const dbadress = require('fs').readFileSync('./dbadress.txt').toString()

class db {
    static async init() {
        // var result
        // axios.get(dbadress).then(res => {
        //     if (res.data) {
        //         result = res.data
        //         // console.log(result)
        //         // return res.data
        //     }
        //     else {
        //         result = []
        //     }
        // }).catch(err => {
        //     console.log(err)
        // })
        // console.log(result)
        // return result
        // try {
        //     const { data } = await axios.get(dbadress)
        //     if (data) return data
        //     else return []
        // } catch (err) {
        //     console.log(err)
        // }
        try {
            // const token = localStorage.getItem('jwt');
            // const config = { headers: { 'x-auth-token': token } };
            const response = await axios.get(dbadress)
            if (response.status === 200) { // response - object, eg { status: 200, message: 'OK' }
                return response.data
            }
        } catch (err) {
            console.error(err)
            return false
        }
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
        const chats = db.init(require('fs').readFileSync('dbadress.txt'))
        let uns = [], fns = []
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
