var CryptoJS = require('crypto-js')
var eccrypto = require('eccrypto')
var randomBytes = require('randombytes')
var secp256k1 = require('secp256k1')
var bs58 = require('bs58')
var GrowInt = require('growint')
var fetch = require('node-fetch')
var bwGrowth = 10000000
var vtGrowth = 360000000

function status(response) {   
    if (response.ok)
        return response
    return response.json().then(res => Promise.reject(res))
}

var teelkey = {
    config: {
        api: ['https://teelkey.com:443'],
        //api: ['http://127.0.0.1:3002']
    },
    init: (config) => {
        teelkey.config = config
    },
    getAccount: (name, cb) => {
        fetch(teelkey.randomNode()+'/account/'+name, {
            method: 'get',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        }).then(res => res.json()).then(function(res) {
            cb(null, res)
        }).catch(function(error) {
            cb(error)
        })
    },
    getAccountHistory: (name, lastBlock, cb) => {
        fetch(teelkey.randomNode()+'/history/'+name+'/'+lastBlock, {
            method: 'get',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        }).then(res => res.json()).then(function(res) {
            cb(null, res)
        }).catch(function(error) {
            cb(error)
        })
    },
    getAccounts: (names, cb) => {
        fetch(teelkey.randomNode()+'/accounts/'+names.join(','), {
            method: 'get',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        }).then(res => res.json()).then(function(res) {
            cb(null, res)
        }).catch(function(error) {
            cb(error)
        })
    },
    getContent: (name, link, cb) => {
        fetch(teelkey.randomNode()+'/content/'+name+'/'+link, {
            method: 'get',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        }).then(status).then(res => res.json()).then(function(res) {
            cb(null, res)
        }).catch(function(err) {
            cb(err)
        })
    },
    getFollowing: (name, cb) => {
        fetch(teelkey.randomNode()+'/follows/'+name, {
            method: 'get',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        }).then(res => res.json()).then(function(res) {
            cb(null, res)
        }).catch(function(err) {
            cb(err)
        })
    },
    getFollowers: (name, cb) => {
        fetch(teelkey.randomNode()+'/followers/'+name, {
            method: 'get',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        }).then(res => res.json()).then(function(res) {
            cb(null, res)
        }).catch(function(err) {
            cb(err)
        })
    },
    generateCommentTree: (root, author, link) => {
        var replies = []
        var content = null
        if (author === root.author && link === root.link) 
            content = root
        else 
            content = root.comments[author+'/'+link]
        
        if (!content || !content.child || !root.comments) return []
        for (var i = 0; i < content.child.length; i++) {
            var comment = root.comments[content.child[i][0]+'/'+content.child[i][1]]
            comment.replies = teelkey.generateCommentTree(root, comment.author, comment.link)
            comment.ups = 0
            comment.downs = 0
            if (comment.votes) 
                for (let i = 0; i < comment.votes.length; i++) {
                    if (comment.votes[i].vt > 0)
                        comment.ups += comment.votes[i].vt
                    if (comment.votes[i].vt < 0)
                        comment.downs -= comment.votes[i].vt
                }
            
            comment.totals = comment.ups - comment.downs
            replies.push(comment)
        }
        replies = replies.sort(function(a,b) {
            return b.totals-a.totals
        })
        return replies
    },
    getDiscussionsByAuthor: (username, author, link, cb) => {
        if (!author && !link) 
            fetch(teelkey.randomNode()+'/blog/'+username, {
                method: 'get',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            }).then(res => res.json()).then(function(res) {
                cb(null, res)
            }).catch(function(error) {
                cb(error)
            })
        else 
            fetch(teelkey.randomNode()+'/blog/'+username+'/'+author+'/'+link, {
                method: 'get',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            }).then(res => res.json()).then(function(res) {
                cb(null, res)
            }).catch(function(error) {
                cb(error)
            })
        
    },
    getNewDiscussions: (author, link, cb) => {
        if (!author && !link) 
            fetch(teelkey.randomNode()+'/new', {
                method: 'get',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            }).then(res => res.json()).then(function(res) {
                cb(null, res)
            }).catch(function(error) {
                cb(error)
            })
        else 
            fetch(teelkey.randomNode()+'/new/'+author+'/'+link, {
                method: 'get',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            }).then(res => res.json()).then(function(res) {
                cb(null, res)
            }).catch(function(error) {
                cb(error)
            })
        
    },
    getHotDiscussions: (author, link, cb) => {
        if (!author && !link) 
            fetch(teelkey.randomNode()+'/hot', {
                method: 'get',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            }).then(res => res.json()).then(function(res) {
                cb(null, res)
            }).catch(function(error) {
                cb(error)
            })
        else 
            fetch(teelkey.randomNode()+'/hot/'+author+'/'+link, {
                method: 'get',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            }).then(res => res.json()).then(function(res) {
                cb(null, res)
            }).catch(function(error) {
                cb(error)
            })
        
    },
    getTrendingDiscussions: (author, link, cb) => {
        if (!author && !link) 
            fetch(teelkey.randomNode()+'/trending', {
                method: 'get',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            }).then(res => res.json()).then(function(res) {
                cb(null, res)
            }).catch(function(error) {
                cb(error)
            })
        else 
            fetch(teelkey.randomNode()+'/trending/'+author+'/'+link, {
                method: 'get',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            }).then(res => res.json()).then(function(res) {
                cb(null, res)
            }).catch(function(error) {
                cb(error)
            })
        
    },
    getFeedDiscussions: (username, author, link, cb) => {
        if (!author && !link) 
            fetch(teelkey.randomNode()+'/feed/'+username, {
                method: 'get',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            }).then(res => res.json()).then(function(res) {
                cb(null, res)
            }).catch(function(error) {
                cb(error)
            })
        else 
            fetch(teelkey.randomNode()+'/feed/'+username+'/'+author+'/'+link, {
                method: 'get',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            }).then(res => res.json()).then(function(res) {
                cb(null, res)
            }).catch(function(error) {
                cb(error)
            })
        
    },
    getNotifications: (username, cb) => {
        fetch(teelkey.randomNode()+'/notifications/'+username, {
            method: 'get',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        }).then(res => res.json()).then(function(res) {
            cb(null, res)
        }).catch(function(error) {
            cb(error)
        })
    },
    getSchedule: (cb) => {
        fetch(teelkey.randomNode()+'/schedule', {
            method: 'get',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        }).then(res => res.json()).then(function(res) {
            cb(null, res)
        }).catch(function(error) {
            cb(error)
        })
    },
    getLeaders: (cb) => {
        fetch(teelkey.randomNode()+'/allminers', {
            method: 'get',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        }).then(res => res.json()).then(function(res) {
            cb(null, res)
        }).catch(function(error) {
            cb(error)
        })
    },
    getRewardPool: (cb) => {
        fetch(teelkey.randomNode()+'/rewardpool', {
            method: 'get',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        }).then(res => res.json()).then(function(res) {
            cb(null, res)
        }).catch(function(error) {
            cb(error)
        })
    },
    getRewards: (name, cb) => {
        fetch(teelkey.randomNode()+'/distributed/'+name, {
            method: 'get',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        }).then(res => res.json()).then(function(res) {
            cb(null, res)
        }).catch(function(error) {
            cb(error)
        })
    },
    keypair: () => {
        let priv, pub
        do {
            priv = Buffer.from(randomBytes(32).buffer)
            pub = secp256k1.publicKeyCreate(priv)
        } while (!secp256k1.privateKeyVerify(priv))
    
        return {
            pub: bs58.encode(pub),        
            priv: bs58.encode(priv)
        }
    },
    privToPub: (priv) => {
        return bs58.encode(
            secp256k1.publicKeyCreate(
                bs58.decode(priv)))
    },
    sign: (privKey, sender, tx) => {
        if (typeof tx !== 'object') 
            try {
                tx = JSON.parse(tx)
            } catch(e) {
                console.log('invalid transaction')
                return
            }
        tx.sender = sender
        // add timestamp to seed the hash (avoid transactions reuse)
        tx.ts = new Date().getTime()
        // hash the transaction
        tx.hash = CryptoJS.SHA256(JSON.stringify(tx)).toString()
        // sign the transaction
        var signature = secp256k1.sign(Buffer.from(tx.hash, 'hex'), bs58.decode(privKey))
        tx.signature = bs58.encode(signature.signature)
        return tx
    },
    sendTransaction: (tx, cb) => {
        teelkey.sendRawTransaction(tx, function(error, headBlock) {
            if (error) 
                cb(error)
            else 
                setTimeout(function() {
                    teelkey.verifyTransaction(tx, headBlock, 5, function(error, block) {
                        if (error) console.log(error)
                        else cb(null, block)
                    })
                }, 1500)
            
        })
    },
    sendRawTransaction: (tx, cb) => {
        fetch(teelkey.randomNode()+'/transact', {
            method: 'post',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tx)
        }).then(function(res) {
            if (res.status === 500) 
                res.json().then(function(err) {
                    cb(err)
                })
            else 
                res.text().then(function(headBlock) {
                    cb(null, parseInt(headBlock))
                })
        })
    },
    verifyTransaction: (tx, headBlock, retries, cb) => {
        var nextBlock = headBlock+1
        fetch(teelkey.randomNode()+'/block/'+nextBlock, {
            method: 'get',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        }).then(res => res.text()).then(function(text) {
            try {
                var block = JSON.parse(text)
            } catch (error) {
                // block is not yet available, retrying in 1.5 secs
                if (retries <= 0) return
                retries--
                setTimeout(function(){teelkey.verifyTransaction(tx, headBlock, retries, cb)}, 1500)
                return
            }

            var isConfirmed = false
            for (let i = 0; i < block.txs.length; i++) 
                if (block.txs[i].hash === tx.hash) {
                    isConfirmed = true
                    break
                }
            

            if (isConfirmed) 
                cb(null, block)
            else if (retries > 0) {
                retries--
                setTimeout(function(){teelkey.verifyTransaction(tx, nextBlock, retries, cb)},3000)
            } else 
                cb('Failed to find transaction up to block #'+nextBlock)
            
        })
    },
    encrypt: (pub, message, ephemPriv, cb) => {
        // if no ephemPriv is passed, a new random key is generated
        if (!cb) {
            cb = ephemPriv
            ephemPriv = teelkey.keypair().priv
        }
        try {
            if (ephemPriv)
                ephemPriv = bs58.decode(ephemPriv)
            var pubBuffer = bs58.decode(pub)
            eccrypto.encrypt(pubBuffer, Buffer.from(message), {
                ephemPrivateKey: ephemPriv
            }).then(function(encrypted) {
                // reducing the encrypted buffers into base 58
                encrypted.iv = bs58.encode(encrypted.iv)
                // compress the sender's public key to compressed format
                // shortens the encrypted string length
                encrypted.ephemPublicKey = secp256k1.publicKeyConvert(encrypted.ephemPublicKey, true)
                encrypted.ephemPublicKey = bs58.encode(encrypted.ephemPublicKey)
                encrypted.ciphertext = bs58.encode(encrypted.ciphertext)
                encrypted.mac = bs58.encode(encrypted.mac)
                encrypted = [
                    encrypted.iv,
                    encrypted.ephemPublicKey,
                    encrypted.ciphertext,
                    encrypted.mac
                ]
                
                // adding the _ separator character
                encrypted = encrypted.join('_')
                cb(null, encrypted)
            }).catch(function(error) {
                cb(error)
            })
        } catch (error) {
            cb(error)
        }
    },
    decrypt: (priv, encrypted, cb) => {
        try {
            // converting the encrypted string to an array of base58 encoded strings
            encrypted = encrypted.split('_')
            
            // then to an object with the correct property names
            var encObj = {}
            encObj.iv = bs58.decode(encrypted[0])
            encObj.ephemPublicKey = bs58.decode(encrypted[1])
            encObj.ephemPublicKey = secp256k1.publicKeyConvert(encObj.ephemPublicKey, false)
            encObj.ciphertext = bs58.decode(encrypted[2])
            encObj.mac = bs58.decode(encrypted[3])

            // and we decode it with our private key
            var privBuffer = bs58.decode(priv)
            eccrypto.decrypt(privBuffer, encObj).then(function(decrypted) {
                cb(null, decrypted.toString())
            }).catch(function(error) {
                cb(error)
            })
        } catch (error) {
            cb(error)
        }
    },
    randomNode: () => {
        var nodes = teelkey.config.api
        if (typeof nodes === 'string') return nodes
        else return nodes[Math.floor(Math.random()*nodes.length)]
    },
    votingPower: (account) => {
        return new GrowInt(account.vt, {growth:account.balance/(vtGrowth)})
            .grow(new Date().getTime()).v
    },
    bandwidth: (account) => {
        return new GrowInt(account.bw, {growth:account.balance/(bwGrowth), max:256000})
            .grow(new Date().getTime()).v
    },
    TransactionType: {
        NEW_ACCOUNT: 0,
        APPROVE_NODE_OWNER: 1,
        DISAPROVE_NODE_OWNER: 2,
        TRANSFER: 3,
        COMMENT: 4,
        VOTE: 5,
        USER_JSON: 6,
        FOLLOW: 7,
        UNFOLLOW: 8,
        NEW_KEY: 9,
        REMOVE_KEY: 10,
        CHANGE_PASSWORD: 11,
        CHANGE_RECOVERY: 12,
        START_RECOVERING: 13,
        RECOVER_ACCOUNT: 14,
        PROMOTED_COMMENT: 15,
        TRANSFER_VT: 16,
        TRANSFER_BW: 17,
        TRANSFER_ASSET: 18,
        TRANSFER_NFT: 19,
        BID_NFT: 20,
        SELL_NFT: 21,
        TRADE_NFT: 22,
        BUY: 23,
        SELL: 24,
        CREATE_ASSET: 25,
        ISSUE_ASSET: 26,
        USER_MASTER_JSON: 27
    }
}

if (typeof window != 'undefined') window.jteelkey = teelkey
module.exports = teelkey