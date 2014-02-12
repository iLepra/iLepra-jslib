module.exports = function(self) {
    /**
     * Chat object initializer
     * @return {Object} chat object
     */
    var chatInit = function () {
        /**
         * Latest messages
         * @type {Array}
         */
        this.messages = [];

        /**
         * WTF id to be used to post messages to chat
         * @type {String}
         */
        this.wtf = null;

        /**
         * Default chat key (room ID)
         * @type {String}
         */
        this.defaultKey = 'leprosorium.ru/';

        return this;
    };

    /**
     * Gets latest chat messages
     * @param  {Function}  callback executed upon completition with Boolean indicating status
     * @return {undefined}
     */
    chatInit.prototype.getMessages = function(callback){
        var data = {
            wtf: self.chat.wtf,
            key: self.chat.defaultKey,
            last: self.getLastId(),
        };

        self.log('getting chat...'.yellow);

        self.request.post({url: 'http://leprosorium.ru/chatctl/', form: data}, function(error, response, data){
            if (error || response.statusCode !== 200) {
                // report error
                self.log('error loading chat in:'.red, error, response.statusCode);

                callback(false);
                return;
            }

            var i, res = JSON.parse(data);

            for(i in res.messages){
                if (self.chat.messages.indexOf(res.messages[i]) === -1)
                    self.chat.messages.push(res.messages[i]);
            }

            self.log('getting chat ok!'.green);

            // dispatch event
            callback(true);
        });
    };

    /**
     * Sends given message to current chat room
     * @param  {String}    text     message to be sent
     * @param  {Function}  callback executed upon completition with Boolean indicating status
     * @return {undefined}
     */
    chatInit.prototype.sendMessage = function(text, callback){
        var data = {
            wtf: self.chat.wtf,
            key: self.chat.defaultKey,
            last: self.getLastId(),
            body: text,
        };

        self.log('posting to chat...'.yellow);

        self.request.post({url: 'http://leprosorium.ru/chatctl/', form:data}, function(error, response, data){
            if (error || response.statusCode !== 200) {
                // report error
                self.log('error posting to chat in:'.red, error, response.statusCode);

                callback(false);
                return;
            }

            var i, res = JSON.parse(data);

            for(i in res.messages){
                if (self.chat.messages.indexOf(res.messages[i]) === -1)
                    self.chat.messages.push(res.messages[i]);
            }

            self.log('posting to chat ok!'.green);

            // dispatch event
            callback(true);
        });
    };

    return new chatInit();
};
