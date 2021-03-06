module.exports = function(self) {
    /**
     * Sublepras object initializer
     * @return {Object} sublepras object
     */
    var subInit = function () {
        /**
         * List of sublepras
         * @type {Array}
         */
        this.list = null;

        /**
         * List of posts for specific sublepra
         * @type {Array}
         */
        this.posts = null;

        /**
         * Fetched posts count
         * @type {Number}
         */
        this.postCount = 0;

        return this;
    };

    /**
     * Get list of sublepras
     * @param  {Function} callback executed upon completition with Boolean indicating status
     * @return {undefined}
     */
    subInit.prototype.getList = function(callback) {
        self.log('getting sublepras...'.yellow);

        self.request({url:'http://leprosorium.ru/underground/readers/'}, function(error, response, data){
            if (error || response.statusCode !== 200) {
                // report error
                self.log('error getting sublepras in:'.red, error, response.statusCode);

                callback(false);
                return;
            }

            // cleanup data
            data = data.replace(/\n+/g, '');
            data = data.replace(/\r+/g, '');
            data = data.replace(/\t+/g, '');

            self.sub.list = [];

            var subReg, res, name, sublepra;

            subReg = /<strong class="jj_logo"><a href="(.+?)"><img src="(.+?)" alt="(.*?)" \/>.+?<a href=".*?\/users\/.+?">(.+?)<\/a>/g;
            res = subReg.exec(data);

            while(res !== null){
                name = res[3] ? res[3] : res[1];

                sublepra = {
                    name: name,
                    creator: res[4],
                    link: res[1],
                    logo: res[2]
                };
                self.sub.list.push(sublepra);

                res = subReg.exec(data);
            }

            // dispatch event
            self.log('got sublepras!'.green);

            callback(true);
        });
    };

    /**
     * Get posts for given sublepra
     * @param  {String}   url      sublepra url
     * @param  {Function} callback executed upon completition with Boolean indicating status
     * @return {undefined}
     */
    subInit.prototype.getPosts = function(url, callback) {
        // get data
        self.sub.postCount = 0;

        self.log('getting sublepra posts...'.yellow);

        self.request.post({url: url+'/idxctl/', from:self.sub.postCount}, function(error, response, data){
            if (error || response.statusCode !== 200) {
                // report error
                self.log('error getting sublepra posts in:'.red, error, response.statusCode);

                callback(false);
                return;
            }

            // convert string to object
            data = JSON.parse(data);
            // init posts array
            self.sub.posts = [];
            // parse
            self.util.processJSONPosts(data.posts, self.sub.posts);

            self.log('got sublepra posts!'.green);

            // trigger event
            callback(true);
        });
    };

    /**
     * Get more posts for given sublepra
     * @param  {String}   url      sublepra url
     * @param  {Function} callback executed upon completition with Boolean indicating status
     * @return {undefined}
     */
    subInit.prototype.getMorePosts = function(url, callback) {
        // increase post count
        self.sub.postCount += 42;

        self.log('getting more sublepra posts...'.yellow);

        self.request.post({url: url+'/idxctl/', from:self.sub.postCount}, function(error, response, data){
            if (error || response.statusCode !== 200) {
                // report error
                self.log('error getting sublepra more posts in:'.red, error, response.statusCode);

                callback(false);
                return;
            }

            // convert string to object
            data = JSON.parse(data);
            // parse
            self.util.processJSONPosts(data.posts, self.sub.posts);

            self.log('got sublepra more posts!'.green);

            // trigger event
            callback(true);
        });
    };

    return new subInit();
};
