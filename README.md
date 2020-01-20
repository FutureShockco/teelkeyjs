# TeelkeyJS

## Install
#### Require style
Install with `npm install --save teelkey` inside your project. Then just
```
const teelkey = require('teelkey')
```
#### CDN style
If you are working in the browser and want to load teelkey from a CDN:
```
<script src="https://unpkg.com/teelkey/bin/teelkey.min.js"></script>
```

By default, teelkey hits on the main teelkey testnet (https://testnet.teelkey.com). You can eventually make teelkey hit on your local node or any teelkey node like so:

```
teelkey.init({api: 'http://localhost:3001'})
```

## GET API

### GET single account
```
teelkey.getAccount('alice', (err, account) => {
    console.log(err, account)
})
```

### GET many accounts
Just pass an array of usernames instead
```
teelkey.getAccounts(['alice', 'bob'], (err, accounts) => {
    console.log(err, accounts)
})
```

### GET account transaction history
For the history, you also need to specify a block number. The api will return all blocks lower than the specified block where the user was involved in a transaction
```
teelkey.getAccountHistory('alice', 0, (err, blocks) => {
    console.log(err, blocks)
})
```
### GET single content
```
teelkey.getContent('alice', 'pocNl2YhZdM', (err, content) => {
    console.log(err, content)
})
```

### GET followers
```
teelkey.getFollowers('alice', (err, followers) => {
    console.log(err, followers)
})
```

### GET following
```
teelkey.getFollowers('alice', (err, followers) => {
    console.log(err, followers)
})
```

### GET contents by author
You can pass a username and permlink (identifying a content) in the 2nd and 3rd argument to 'get more'.
```
teelkey.getDiscussionsByAuthor('alice', null, null, (err, contents) => {
    console.log(err, contents)
})
```

### GET contents by creation time
You can pass a username and a permlink to 'get more'.
```
teelkey.getNewDiscussions('alice', null, null, (err, contents) => {
    console.log(err, contents)
})
```

### GET contents by popularity (hot)
You can pass a username and a permlink to 'get more'.
```
teelkey.getHotDiscussions(null, null, (err, contents) => {
    console.log(err, contents)
})
```

### GET contents by feed
This lists the contents posted by the following of the passed username.

You can pass a username and a permlink in the 2nd and 3rd argument to 'get more'.
```
teelkey.getFeedDiscussions('alice', null, null, (err, contents) => {
    console.log(err, contents)
})
```

### GET notifications
```
teelkey.getNotifications('alice', (err, contents) => {
    console.log(err, contents)
})
```

## POST API

To send a transaction to the network, you will need multiple steps. First you need to define your transaction and sign it.

```
var newTx = {
    type: teelkey.TransactionType.FOLLOW,
    data: {
        target: 'bob'
    }
}

newTx = teelkey.sign(alice_key, 'alice', newTx)
```
After this step, the transaction is forged with a timestamp, hash, and signature. This transaction needs to be sent in the next 60 secs or will be forever invalid.

You can send it like so
```
teelkey.sendTransaction(newTx, function(err, res) {
    cb(err, res)
})
```
The callback will return once your transaction has been included in a new block.

Alternatively, you can just want the callback as soon as the receiving node has it, you can do:
```
teelkey.sendRawTransaction(newTx, function(err, res) {
    cb(err, res)
})
```

## Convenience

### Generate a keypair
```
console.log(teelkey.keypair())
```

### Growing variables
Voting Power and Bandwidth are growing in time but the API will only return the latest update in the `vt` and `bw` fields of the accounts. To get the actual value, use votingPower() and bandwidth()
```
teelkey.getAccount('alice', (err, account) => {
    console.log(teelkey.votingPower(account))
    console.log(teelkey.bandwidth(account)) 
})
```

### Credits
We would like to give all the credits to the people making available these resources.
- Avalon : https://github.com/dtube/avalon
