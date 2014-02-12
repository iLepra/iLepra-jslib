module.exports = function(self) {
    /**
     * Government object initializer
     * @return {Object} government object
     */
    var govInit = function () {
        /**
         * Current president name
         * @type {String}
         */
        this.president = null;

        /**
         * Timespan for the current president
         * @type {String}
         */
        this.time = null;

        /**
         * List of ministers
         * @type {Array}
         * @todo implement fetching
         */
        this.ministers = null;

        /**
         * List of banned users
         * @type {Array}
         * @todo implement fetching
         */
        this.banned = null;

        return this;
    };

    /**
     * Gets current government
     * @param  {Function}  callback executed upon completition with Boolean indicating status
     * @return {undefined}
     */
    govInit.prototype.getCurrent = function(callback){
        self.log('getting government...'.yellow);

        self.request({url: 'http://leprosorium.ru/democracy/'}, function(error, response, data){
            if (error || response.statusCode !== 200) {
                // report error
                self.log('error getting government in:'.red, error, response.statusCode);

                callback(false);
                return;
            }

            // cleanup data
            data = data.replace(/\n+/g, '');
            data = data.replace(/\r+/g, '');
            data = data.replace(/\t+/g, '');

            // regex
            var prReg = /<div id="president"><a href=".+?">(.+?)<\/a><p>.+?<br \/>(.+?)<\/p><\/div>/g,
            // get data
            pr = prReg.exec(data);
            self.gov.president = pr[1];
            self.gov.time = pr[2];

            self.log('got government!'.green);

            // dispatch event
            callback(true);
        });
    };

    return new govInit();
};
