/*global module:false*/
module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        concat: {
            ilepra: {
                src: ['lepra.js', 'lepra.util.js', 'lepra.ui.js', 'lepra.post.js',
                    'lepra.profile.js', 'lepra.sub.js', 'lepra.gov.js', 'lepra.chat.js'],
                dest: 'lepra.concat.js'
            }
        },
        min: {
            ilepra: {
                src: ['lepra.concat.js'],
                dest: 'lepra.min.js'
            }
        },
        uglify: {
            mangle: {toplevel: false},
            squeeze: {dead_code: false}
        }
    });

    // Default task.
    grunt.registerTask('default', 'concat min');
};