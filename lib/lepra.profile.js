module.exports = function(self) {
    /**
     * Profile object initializer
     * @return {Object} profile object
     */
    var profileInit = function() {
        /**
         * Current profile data
         * @type {Object}
         */
        this.data = null;

        return this;
    };

    /**
     * Gets profile for given username
     * @param  {String}   username user to get profile for
     * @param  {Function} callback executed upon completition with Boolean indicating status
     * @return {undefined}
     */
    profileInit.prototype.getProfile = function(username, callback) {
        var url, userpic, regdata, num, date, name, loc, karma,
            statWrote, statRate, userstat, votestat, story, contacts;

        url = 'http://leprosorium.ru/users/'+username;

        self.log('getting profile for :'.yellow, username.yellow);

        self.request({url:url}, function(error, response, data){
            if (error || response.statusCode !== 200) {
                // report error
                self.log('error getting profile in:'.red, error, response.statusCode);

                callback(false);
                return;
            }

            // cleanup data
            data = data.replace(/\n+/g, '');
            data = data.replace(/\r+/g, '');
            data = data.replace(/\t+/g, '');

            userpic = /<table class="userpic"><tbody><tr><td><img src="(.+?)".+?\/>/g.exec(data);
            if( userpic ){
                userpic = userpic[1];
            }else{
                userpic = '';
            }

            regdata = /<div class="userregisterdate">(.+?)<\/div>/g.exec(data)[1].replace(/\./g, '').split(', ');
            num = regdata[0];
            date = regdata[1];

            name = /<div class="userbasicinfo"><h3>(.+?)<\/h3>/g.exec(data)[1];
            loc = /<div class="userego">(.+?)<\/div>/g.exec(data)[1];
            karma = /<span class="rating" id="js-user_karma".+?><em>(.+?)<\/em>/g.exec(data)[1];

            statWrote = /<div class="userstat userrating">(.+?)<\/div>/g.exec(data);
            statRate = /<div class="userstat uservoterate">Вес голоса&nbsp;&#8212; (.+?)<br.*?>Голосов в день&nbsp;&#8212; (.+?)<\/div>/g.exec(data);
            userstat = statWrote[1].replace(/(<([^>]+)>)/ig, ' ');
            votestat = 'Вес голоса&nbsp;&#8212; '+statRate[1]+',<br>Голосов в день&nbsp;&#8212; '+statRate[2];

            story = /<div class="userstory">(.+?)<\/div>/g.exec(data);
            if (story !== null) {
                story = story[1];
            } else {
                story = '';
            }

            contacts = /<div class="usercontacts">(.+?)<\/div>/g.exec(data)[1].split(/<br.*?>/);

            self.profile.data = {
                username: username,
                userpic: userpic,
                number: num,
                regDate: date,
                fullName: name,
                location: loc,
                karma: karma,
                userstat: userstat,
                votestat: votestat,
                contacts: contacts,
                description: story
            };

            self.log('got profile!'.green);

            // dispatch event
            callback(true);
        });
    };

    return new profileInit();
};
