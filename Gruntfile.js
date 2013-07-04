module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: ["*.js"],
            options: {
                // Settings
                "passfail": false, // Stop on first error.
                "maxerr": 10000, // Maximum error before stopping.

                // Predefined globals whom JSHint will ignore.
                "browser": true, // Standard browser globals e.g. `window`, `document`.
                // node predefined stuff
                "node": true,
                "rhino": false,
                "couch": false,
                "wsh": false, // Windows Scripting Host.

                "jquery": true,
                "prototypejs": false,
                "mootools": false,
                "dojo": false,

                "predef": [ // Custom globals.
                    "console",
                    "require",
                    "define",
                    "module",
                    "__dirname",
                    "exports",
                    "requirejs"
                ],

                // Development.
                "debug": false, // Allow debugger statements e.g. browser breakpoints.
                "devel": false, // Allow developments statements e.g. `console.log();`.


                // ECMAScript 5.
                "es5": false, // Allow ECMAScript 5 syntax.
                "strict": false, // Require `use strict` pragma  in every file.
                "globalstrict": false, // Allow global "use strict" (also enables 'strict').


                // The Good Parts.
                "asi": false, // Tolerate Automatic Semicolon Insertion (no semicolons).
                "laxbreak": false, // Tolerate unsafe line breaks e.g. `return [\n] x` without semicolons.
                "bitwise": false, // Prohibit bitwise operators (&, |, ^, etc.).
                "boss": false, // Tolerate assignments inside if, for & while. Usually conditions & loops are for comparison, not assignments.
                "curly": false, // Require {} for every new block or scope.
                "eqeqeq": true, // Require triple equals i.e. `===`.
                "eqnull": false, // Tolerate use of `== null`.
                "evil": false, // Tolerate use of `eval`.
                "expr": false, // Tolerate `ExpressionStatement` as Programs.
                "forin": false, // Tolerate `for in` loops without `hasOwnPrototype`.
                "immed": true, // Require immediate invocations to be wrapped in parens e.g. `( function(){}() );`
                "latedef": true, // Prohibit variable use before definition.
                "loopfunc": false, // Allow functions to be defined within loops.
                "noarg": true, // Prohibit use of `arguments.caller` and `arguments.callee`.
                "regexp": true, // Prohibit `.` and `[^...]` in regular expressions.
                "regexdash": false, // Tolerate unescaped last dash i.e. `[-...]`.
                "scripturl": false, // Tolerate script-targeted URLs.
                "shadow": false, // Allows re-define variables later in code e.g. `var x=1; x=2;`.
                "supernew": false, // Tolerate `new function () { ... };` and `new Object;`.
                "undef": true, // Require all non-global variables be declared before they are used.

                // Personal styling preferences.
                "newcap": true, // Require capitalization of all constructor functions e.g. `new F()`.
                "noempty": true, // Prohibit use of empty blocks.
                "nonew": true, // Prohibit use of constructors for side-effects.
                "nomen": false, // Prohibit use of initial or trailing underbars in names.
                "onevar": true, // Allow only one `var` statement per function.
                "plusplus": false, // Prohibit use of `++` & `--`.
                "sub": false, // Tolerate all forms of subscript notation besides dot notation e.g. `dict['key']` instead of `dict.key`.
                "trailing": true, // Prohibit trailing whitespaces.
                "white": false, // Check against strict whitespace and indentation rules.
                "indent": 4 // Specify indentation spacing
            }
        },
    });

    // load extensions
    grunt.loadNpmTasks('grunt-contrib-jshint');

    // Default task(s).
    grunt.registerTask('default', ['jshint', 'test']);

    // Alias the `test` task to run `mocha` instead
    grunt.registerTask('test', 'run mocha', function() {
        var done = this.async();
        require('child_process').exec('./node_modules/mocha/bin/mocha -R spec -t 5000 ./test/', function(err, stdout) {
            grunt.log.write(stdout);
            done(err);
        });
    });
};