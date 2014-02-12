// requires
var request = require('request');
var colors = require('colors');

// init main object
var iLepra = function() {
    var self = this;

    /**
     * Custom logging function
     * Only outputs if config.debug is true
     */
    self.log = function() {
        if(self.config.debug) {
            Array.prototype.unshift.call(arguments, '[leprabox] '.white);
            console.log.apply(this, arguments);
        }
    };

    /**
     * Replaces class instance of request.js
     * with new one that is filled with given cookies
     *
     * @param  {Array} cookies array of cookies to use
     */
    this.fillRequestWithCookies = function(cookies){
        var j = request.jar();
        var i, len = cookies.length;

        // fill container with cookies
        for(i = 0; i < len; i++) {
            j.setCookie(request.cookie(cookies[i]), 'http://leprosorium.ru');
        }

        // replace default request with new one with cookies
        self.request = request.defaults({jar: j});
    };

    /**
     * Local instance of request.js
     * @type {Object}
     */
    this.request = request.defaults({jar: true});

    /**
     * Maximum caching time after which
     * data should be re-fetched from server
     * @type {Number}
     */
    this.cacheTime = 30 * 60000;

    /**
     * Time when latest posts was fetched
     * @type {Number}
     */
    this.lastPostFetchTime = null;

    /**
     * Time when user's "my stuff" posts was fetched
     * @type {Number}
     */
    this.myStuffFetchTime = null;

    /**
     * Time when user's inbox posts was fetched
     * @type {Number}
     */
    this.inboxFetchTime = null;

    /**
     * Object that contains count of new posts and comments in my stuff
     * @type {Object}
     */
    this.myStuffOldNew = {c:null, p:null};

    /**
     * Object that contains count of new posts and comments in inbox
     * @type {Object}
     */
    this.inboxOldNew = {c:null, p:null};

    /**
     * Library config
     * @type {Object}
     */
    this.config = {
        /**
         * If library should run in debug mode
         * @type {Boolean}
         */
        debug: false,

        /**
         * Biggest side of screen template.
         * Can be replaced on client with Number
         * to resize image by max side
         * @type {String}
         */
        screenBiggest: '%screen%'
    };

    /**
     * Whether user is authenticated
     * @type {Boolean}
     */
    this.isAuthenticated = false;

    /**
     * Login code for current captcha image
     * @type {String}
     */
    this.loginCode = null;

    /**
     * URL for current captcha image
     * @type {String}
     */
    this.captchaURL = null;

    /**
     * Current user cookies
     * @type {Array}
     */
    this.cookies = null;

    /**
     * Current extended error message
     * @type {String}
     */
    this.errorMessage = null;

    /**
     * Current user username
     * @type {String}
     */
    this.username = null;

    /**
     * Current user list of sublepras
     * @type {Array}
     */
    this.userSubLepras = null;

    /**
     * Count of new posts in inbox
     * @type {Number}
     */
    this.inboxNewPosts = null;

    /**
     * Count of new comments in inbox
     * @type {Number}
     */
    this.inboxNewComments = null;

    /**
     * User karma
     * @type {Number}
     */
    this.karma = null;

    /**
     * User rating
     * @type {Number}
     */
    this.rating = null;

    /**
     * User vote weight
     * @type {Number}
     */
    this.voteweight = null;

    /**
     * Count of new comments in my stuff
     * @type {Number}
     */
    this.myNewComments = null;

    /**
     * Count of new posts in my stuff
     * @type {Number}
     */
    this.myNewPosts = null;

    /**
     * Fetched latest posts
     * @type {Array}
     */
    this.latestPosts = null;

    /**
     * Count of currently fetched posts
     * @type {Number}
     */
    this.postCount = null;

    /**
     * Current post WTF id
     * @type {String}
     */
    this.postVoteWTF = null;

    /**
     * Fetched posts from my stuff
     * @type {Array}
     */
    this.myStuffPosts = null;

    /**
     * My stuff WTF id
     * @type {String}
     */
    this.myStuffWTF = null;

    /**
     * Fetched favourite posts
     * @type {Array}
     */
    this.favouritePosts = null;

    /**
     * Fetched inbox posts
     * @type {Array}
     */
    this.inboxPosts = null;

    /**
     * WTF id used for logout
     * @type {String}
     */
    this.logoutWTF = null;

    /**
     ** Core submodule
     */
    require('./lib/lepra.core')(this);

    /**
     * Utility submodule
     * @type {Object}
     */
    this.util = require('./lib/lepra.util')(this);

    /**
     * Chat submodule
     * @type {Object}
     */
    this.chat = require('./lib/lepra.chat')(this);

    /**
     * Government submodule
     * @type {Object}
     */
    this.gov = require('./lib/lepra.gov')(this);

    /**
     * Posts submodule
     * @type {Object}
     */
    this.post = require('./lib/lepra.post')(this);

    /**
     * Profile submodule
     * @type {Object}
     */
    this.profile = require('./lib/lepra.profile')(this);

    /**
     * Sublepras submodule
     * @type {Object}
     */
    this.sub = require('./lib/lepra.sub')(this);

    // return new instance
    return this;
};

// export
module.exports = new iLepra();
