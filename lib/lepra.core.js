module.exports = function(self) {
    /***
     Initializes iLepra for work,
     checks if given cookies are valid and user is logged in,
     gets captcha if not and posts if yes
     ***/
    self.init = function(cookies, callback) {
        // add cookies to request if some are given
        if(cookies) {
            self.fillRequestWithCookies(cookies);
        }

        // get lepra
        self.request({url: 'http://leprosorium.ru'}, function(error, response, data){
            if (error || response.statusCode !== 200) {
                // report error
                console.log('error init:'.red, error, response.statusCode);

                callback(false);
                return;
            }

            // report prgoress
            console.log('init loaded'.green);

            if(data.indexOf('<input type="password"') > 0){
                console.log('not authed, getting captcha'.yellow);

                self.processCaptcha(data);
                self.isAuthenticated = false;

                // callback
                callback(false);
            }else{
                console.log('authed ok! getting main page'.green);

                //iLepra.getLastPosts();
                self.isAuthenticated = true;

                // process user's data
                self.processMain(data);

                // callback
                callback(true);
            }
        });
    };

    /***
     Tries logging in with given data
     ***/
    self.tryLogin = function(data, callback){
        // add login code
        data.logincode = self.loginCode;

        console.log('logging in with: '.yellow, data);

        self.request.post({url: 'http://leprosorium.ru/login/', followAllRedirects:true, form: data}, function(error, response, data){
            if (error || response.statusCode !== 200) {
                // report error
                console.log('error logging in:'.red, error, response.statusCode);

                callback(false);
                return;
            }

            console.log('login loaded without error'.green);

            if(data.indexOf('class="error"') > 0){
                // get error
                var errorReg = /<div class="error">(.+?)<\/div>/g;
                self.errorMessage = errorReg.exec(data)[1];

                // get new captcha
                self.processCaptcha(data);

                // dispatch error event and die
                console.log('login error:'.red, self.errorMessage);

                callback(false);
            }else{
                // store cookies
                self.cookies = response.headers['set-cookie'];
                // append cookies to request
                self.fillRequestWithCookies(self.cookies);

                // process user's data
                self.processMain(data);

                // dispatch ok
                console.log('login successful!'.green);

                callback(true);
            }
        });
    };

    /***
     Gets last posts from JSON interface
     ***/
    self.getNewsCounters = function(callback){
        // do request
        self.request({url:'http://leprosorium.ru/api/lepropanel'}, function(error, response, data){
            var res = JSON.parse(data);

            self.inboxNewPosts = parseInt(res.inboxunreadposts, 10);
            self.inboxNewComments = parseInt(res.inboxunreadcomms, 10);
            self.karma = parseInt(res.karma, 10);
            self.rating = parseInt(res.rating, 10);
            self.voteweight = parseInt(res.voteweight, 10);
            self.myNewComments = parseInt(res.myunreadcomms, 10);
            self.myNewPosts = parseInt(res.myunreadposts, 10);

            // trigger update
            callback(true);
        });
    };

    /***
     Gets last posts from JSON interface
     ***/
    self.getLastPosts = function(forceRefresh, callback){
        // default refresh false
        forceRefresh = forceRefresh || false;

        var time = new Date().getTime();
        // check if posts was loaded earlier than 1 min ago
        if (self.lastPostFetchTime !== null && Math.abs(time - self.lastPostFetchTime) < cacheTime && self.latestPosts.length > 0 && !forceRefresh) {
            console.log('posts already loaded!'.yellow);

            // cb
            callback(true);
            return;
        }

        console.log('loading posts...'.yellow);

        // get data
        self.postCount = 0;
        self.request.post({url: 'http://leprosorium.ru/idxctl/', form:{from:self.postCount}}, function(error, response, data){
            if (error || response.statusCode !== 200) {
                // report error
                console.log('error loading posts in:'.red, error, response.statusCode);

                callback(false);
                return;
            }

            lastPostFetchTime = new Date().getTime();

            // convert string to object
            data = JSON.parse(data);
            // init posts array
            self.latestPosts = [];
            // parse
            self.util.processJSONPosts(data.posts, self.latestPosts, self.config.screenBiggest);
            // trigger cb
            console.log('posts loaded!'.green);

            callback(true);
        });
    };

    /***
     Gets more posts from JSON interface from specified count
     ***/
    self.getMorePosts = function(callback){
        // increase post count
        self.postCount += 42;

        console.log('loading more posts...'.yellow);

        self.request.post({url: 'http://leprosorium.ru/idxctl/', form:{from:self.postCount}}, function(error, response, data){
            if (error || response.statusCode !== 200) {
                // report error
                console.log('error loading more posts in:'.red, error, response.statusCode);

                callback(false);
                return;
            }

            // convert string to object
            data = JSON.parse(data);
            // parse
            self.util.processJSONPosts(data.posts, self.latestPosts, self.config.screenBiggest);
            // trigger callback
            callback(true);
        });
    };

    /***
     Switches posts layout
     0 = mix of main & sub
     1 = only main
     2 = only sub
     ***/
    self.switchLayout = function(type, callback){
        // do request
        self.request.post({url: 'http://leprosorium.ru/threshold/', followAllRedirects:true, form:{
            showonindex: type,
            selected_threshold: 'all'
        }}, function(error, response, data){
            if (error || response.statusCode !== 200) {
                // report error
                console.log('error switching layout in:'.red, error, response.statusCode);

                callback(false);
                return;
            }

            self.getLastPosts(true, callback);
        });
    };


    /***
     Gets my stuff posts
     ***/
    self.getMyStuff = function(forceRefresh, callback){
        // default refresh false
        forceRefresh = forceRefresh || false;

        var time = new Date().getTime();
        // check if there's new posts
        if ((self.myNewComments === self.myStuffOldNew.c && self.myNewPosts === self.myStuffOldNew.p) &&
            (self.myStuffFetchTime !== null && Math.abs(time - self.myStuffFetchTime) < self.cacheTime) &&
            self.myStuffPosts.length > 0 && !forceRefresh){
            console.log('mystuff is already loaded:'.green);

            // dispatch ready and die
            callback(true);
            return;
        }

        console.log('loading mystuff..:'.yellow);

        // get data
        self.request({url: 'http://leprosorium.ru/my/'}, function(error, response, data){
            if (error || response.statusCode !== 200) {
                // report error
                console.log('error loading mystuff in:'.red, error, response.statusCode);

                callback(false);
                return;
            }

            self.myStuffOldNew = {
                p: self.myNewPosts,
                c: self.myNewComments
            };
            self.myStuffFetchTime = new Date().getTime();

            self.myStuffPosts = [];
            self.util.processHTMLPosts(data, self.myStuffPosts, undefined, self.config.screenBiggest);

            // trigger callback
            console.log('loaded mystuff:'.green);

            callback(true);
        });
    };

    /***
     Gets favourite posts
     ***/
    self.getFavourites = function(callback){
        // check if posts was loaded earlier
        if (self.favouritePosts !== null && self.favouritePosts.length > 0){
            console.log('favourites already loaded!'.green);

            // dispatch ready and die
            callback(true);
            return;
        }

        console.log('loading favourites..:'.yellow);

        // get data
        self.request({url: 'http://leprosorium.ru/my/favourites/'}, function(error, response, data){
            if (error || response.statusCode !== 200) {
                // report error
                console.log('error loading favourites in:'.red, error, response.statusCode);

                callback(false);
                return;
            }

            self.favouritePosts = [];
            self.util.processHTMLPosts(data, self.favouritePosts, 'fav', self.config.screenBiggest);

            // callback
            console.log('favourites loaded!'.green);

            // dispatch ready and die
            callback(true);
        });
    };

    /***
     Gets inboxes stuff
     ***/
    self.getInbox = function(forceRefresh, callback){
        // default refresh false
        forceRefresh = forceRefresh || false;

        var time = new Date().getTime();
        // check if there's new posts
        if ((self.inboxNewComments === self.inboxOldNew.c && self.inboxNewPosts === self.inboxOldNew.p) &&
            (self.inboxFetchTime !== null && Math.abs(time - self.inboxFetchTime) < self.cacheTime) &&
            self.inboxPosts.length > 0 && !forceRefresh) {
            console.log('inbox already loaded!'.green);

            // dispatch ready and die
            callback(true);
            return;
        }

        console.log('loading inbox..'.yellow);

        // get data
        self.request({url: 'http://leprosorium.ru/my/inbox/'}, function(error, response, data){
            if (error || response.statusCode !== 200) {
                // report error
                console.log('error loading favourites in:'.red, error, response.statusCode);

                callback(false);
                return;
            }

            self.inboxOldNew = {
                p: self.inboxNewPosts,
                c: self.inboxNewComments
            };
            self.inboxFetchTime = new Date().getTime();

            self.inboxPosts = [];
            self.util.processHTMLPosts(data, self.inboxPosts, 'inbox', self.config.screenBiggest);

            console.log('inbox loaded!'.green);

            // dispatch ready and die
            callback(true);
        });
    };

    /**
     * Helper functions
     */
    /***
     Processes given html string for captcha data
     ***/
    self.processCaptcha = function(source){
        var captchaReg = /img alt="captcha" src="(.+?)"/g,
            loginReg = /<input type="hidden" name="logincode" value="(.+?)"/g;

        self.captchaURL = 'http://leprosorium.ru' + captchaReg.exec(source)[1];
        self.loginCode = loginReg.exec(source)[1];

        console.log('got captcha'.green, self.captchaURL, self.loginCode);
    };
    /***
     Processes given html string for user's data
     ***/
    self.processMain = function(data){
        // cleanup data
        data = data.replace(/\n+/g, '');
        data = data.replace(/\r+/g, '');
        data = data.replace(/\t+/g, '');
        // get post vote wtf
        self.postVoteWTF = /wtf_vote = '(.+?)'/g.exec(data)[1];
        // get mystuff wtf
        self.myStuffWTF = /mythingsHandler.wtf = '(.+?)'/g.exec(data)[1];
        // get chat wtf
        self.chat.wtf = /chatHandler.wtf = '(.+?)'/g.exec(data)[1];
        // get username
        self.username = /<div id="greetings" class="columns_wrapper">.+?<a href=".+?">(.+?)<\/a>/g.exec(data)[1];
        // logout wtf
        self.logoutWTF = /name="wtf" value="(.+?)"/g.exec(data)[1];
        // get sublepras
        self.userSubLepras = [];

        // vars
        var subReg, res, sublepra;

        // sub lepra regex
        subReg = /<div class="sub"><strong class="logo"><a href="(.+?)" title="(.*?)"><img src="(.+?)" alt=".+?" \/>.+?<div class="creator">.+?<a href=".*?\/users\/.+?">(.+?)<\/a>/g;

        // get them all
        res = subReg.exec(data);
        while(res !== null){
            sublepra = {
                name: res[2],
                creator: res[4],
                link: res[1],
                logo: res[3]
            };
            self.userSubLepras.push(sublepra);

            res = subReg.exec(data);
        }
    };

    /**
     * Gets last chat message ID
     */
    self.getLastId = function(){
        var last = '',
            biggestId, i;
        if (self.chat.messages.length > 0) {
            biggestId = 0;
            for(i in self.chat.messages ){
                if (parseInt(self.chat.messages[i].id, 10) > biggestId)
                    biggestId = parseInt(self.chat.messages[i].id, 10);
            }
            if (biggestId !== 0) last = biggestId;
        }
        return last;
    };
};
