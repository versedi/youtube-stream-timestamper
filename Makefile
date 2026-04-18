NAME    := youtube-stream-timestamper
VERSION := $(shell node -pe "require('./manifest.json').version" 2>/dev/null || grep '"version"' manifest.json | sed 's/.*"\([0-9.]*\)".*/\1/')
OUT     := dist/$(NAME)-$(VERSION).zip

.PHONY: zip clean

zip:
	@mkdir -p dist
	zip -r $(OUT) manifest.json content.js icons/
	@echo "Built $(OUT)"

clean:
	rm -f dist/$(NAME)-$(VERSION).zip
