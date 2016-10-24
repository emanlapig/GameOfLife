module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      build: {
        src: 'Main',
        dest: 'Main.min.js'
      }
    },
    watch: {
      js: {
        files: ['BGem3.js'],
        tasks: ['uglify']
      }
    }
  });

  // Load the plugin(s).
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['uglify', 'watch']);

};