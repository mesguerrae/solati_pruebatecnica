const peticiones = require('https');

const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/chat",{
    useNewUrlParser: true,
    useUnifiedTopology: true
});


let chatSchema = new mongoose.Schema({
    nick: String,
    message: String,
    date: String,
    type: String
});

let Chat = mongoose.model("chat", chatSchema);


module.exports = (http) => {
    const io = require('socket.io')(http);

    io.on('connection', (socket) => {
        console.log('Userr connected.');
        socket.on('chat-message', (msg) => {
            ///

            const chatSave = {
                date: msg.date,
                message: msg.message,
                nick: msg.nick,
                type: 'question'
            };

            Chat.insertMany([chatSave]).then(function(){
                console.log("Data inserted")  // Success
            }).catch(function(error){
                console.log(error)      // Failure
            });

            io.emit('chat-message', msg);


            const headerDict = {
                'apikey': 'Ut8PgkrY04gbBHaKCzPbwmqhR7aDoTKc',
            }

            const requestOptions = {
                headers: new Headers(headerDict),
            };

            peticiones.get('https://apilayer.net/api/convert?from=USD&to=EUR&amount=' + msg.message + '&access_key=Ut8PgkrY04gbBHaKCzPbwmqhR7aDoTKc', requestOptions, (resp) => {

                let data = '';

                resp.on('data', (chunk) => {
                    data += chunk;
                    console.log('data : ' + data);
                });

                resp.on('end', () => {
                    console.log(JSON.parse(data).explanation);
                });

            }).on("error", (err) => {
                console.log("Error: " + err.message);
            });

            msg.date = new Date().toLocaleDateString()
            msg.message = 'prueba';
            msg.nick = 'auto-bot';

            const chatSave2 = {
                date: msg.date,
                message: msg.message,
                nick: msg.nick,
                type: 'answer'
            };

            Chat.insertMany([chatSave2]).then(function(){
                console.log("Data inserted")  // Success
            }).catch(function(error){
                console.log(error)      // Failure
            });
            io.emit('chat-message', msg);

        });

        socket.on('disconnect', (msg) => {
            console.log('User disconnect');
        });
    });
}