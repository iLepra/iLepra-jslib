module.exports = function(self) {
    var chatInit = function () {
        this.messages = [];
        this.wtf = null;
        this.defaultKey = 'leprosorium.ru/';

        return this;
    };

    chatInit.prototype.getMessages = function(callback){
        var data = {
            wtf: self.chat.wtf,
            key: self.chat.defaultKey,
            last: self.getLastId(),
        };

        console.log('getting chat...'.yellow);

        self.request.post({url: 'http://leprosorium.ru/chatctl/', form: data}, function(error, response, data){
            if (error || response.statusCode !== 200) {
                // report error
                console.log('error loading chat in:'.red, error, response.statusCode);

                callback(false);
                return;
            }

            var i, res = JSON.parse(data);

            for(i in res.messages){
                if (self.chat.messages.indexOf(res.messages[i]) === -1)
                    self.chat.messages.push(res.messages[i]);
            }

            console.log('getting chat ok!'.green);

            // dispatch event
            callback(true);
        });
    };

    chatInit.prototype.sendMessage = function(text, callback){
        var data = {
            wtf: self.chat.wtf,
            key: self.chat.defaultKey,
            last: self.getLastId(),
            body: text,
        };

        console.log('posting to chat...'.yellow);

        self.request.post({url: 'http://leprosorium.ru/chatctl/', form:data}, function(error, response, data){
            if (error || response.statusCode !== 200) {
                // report error
                console.log('error posting to chat in:'.red, error, response.statusCode);

                callback(false);
                return;
            }

            var i, res = JSON.parse(data);

            for(i in res.messages){
                if (self.chat.messages.indexOf(res.messages[i]) === -1)
                    self.chat.messages.push(res.messages[i]);
            }

            console.log('posting to chat ok!'.green);

            // dispatch event
            callback(true);
        });
    };

    return new chatInit();
};
