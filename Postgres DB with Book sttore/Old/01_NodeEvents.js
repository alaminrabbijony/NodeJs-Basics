

const eventEmitter = require('events');

//const myEmitter = new eventEmitter();

eventEmitter.on("test", () => {})

class myEmitter extends eventEmitter {
    constructor (e, message) {
        super(e, message)
    }
    test1 (e ='test') {
        
    }   

}

const myListener = myEmitter.emit('greet')