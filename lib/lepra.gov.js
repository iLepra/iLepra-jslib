module.exports = function(self) {
    var govInit = function () {
        this.president = null;
        this.time = null;
        this.ministers = null;
        this.banned = null;

        return this;
    };

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
