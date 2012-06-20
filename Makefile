default: minify

# top level target
minify: clean
	@echo 'Minifying existing js ...'
	grunt
	@echo 'Cleaning up ...'
	rm -f lepra.concat.js
	@echo 'Finished!'

clean:
	rm -f lepra.concat.js
	rm -f lepra.min.js