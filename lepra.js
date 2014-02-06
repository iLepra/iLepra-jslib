// requires
var request = require('request');
var colors = require('colors');

// init main object
var iLepra = function() {
    var self = this;

    /**
     * Make custom log() to only render if debug is on
     */
    self.log = function() {
        if(self.config.debug) {
            Array.prototype.unshift.call(arguments, '[leprabox] '.white);
            console.log.apply(this, arguments);
        }
    };

    /***
     Add cookie to default request
     ***/
    this.fillRequestWithCookies = function(cookies){
        var j = request.jar();
        var i, len = cookies.length;

        // fill container with cookies
        for(i = 0; i < len; i++) {
            j.add(request.cookie(cookies[i]));
        }

        // replace default request with new one with cookies
        self.request = request.defaults({jar: j});
    };

    //
    // vars
    //

    // local request instance
    this.request = request.defaults({});

    // max cache time
    this.cacheTime = 30 * 60000;
    // last fetch times for stuff
    this.lastPostFetchTime = null;
    this.myStuffFetchTime = null;
    this.inboxFetchTime = null;
    this.myStuffOldNew = {c:null, p:null};
    this.inboxOldNew = {c:null, p:null};

    // config
    this.config = {
        debug: false,
        screenBiggest: 800
    };

    // auth stuff
    this.isAuthenticated = false;
    this.loginCode = null;
    this.captchaURL = null;
    // current cookies
    this.cookies = null;

    // error message
    this.errorMessage = null;

    // user data
    this.username = null;
    this.userSubLepras = null;

    // news data
    this.inboxNewPosts = null;
    this.inboxNewComments = null;
    this.karma = null;
    this.rating = null;
    this.voteweight = null;
    this.myNewComments = null;
    this.myNewPosts = null;

    // posts data
    this.latestPosts = null;
    this.postCount = null;
    this.postVoteWTF = null;

    // mystuff data
    this.myStuffPosts = null;
    this.myStuffWTF = null;
    // fav data
    this.favouritePosts = null;
    // inbox data
    this.inboxPosts = null;
    // logoyt wtf
    this.logoutWTF = null;

    /**
     ** Core submodule
     */
    require('./lib/lepra.core')(this);

    /***
     * Util submodule
     ***/
    this.util = require('./lib/lepra.util')(this);

    /***
     * Chat submodule
     ***/
    this.chat = require('./lib/lepra.chat')(this);

    /***
     * Government submodule
     ***/
    this.gov = require('./lib/lepra.gov')(this);

    /***
     * Post submodule
     ***/
    this.post = require('./lib/lepra.post')(this);

    /***
     * Profile submodule
     ***/
    this.profile = require('./lib/lepra.profile')(this);

    /***
     * Subs submodule
     ***/
    this.sub = require('./lib/lepra.sub')(this);

    // return
    return this;
};

// export
module.exports = new iLepra();
