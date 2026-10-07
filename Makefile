CC=gcc
CFLAGS=-lSDL2 -lm

DIR=examples@examples

INITIAL_MEMORY=$(shell expr 128 \* 1024 \* 1024)

EMFLAGS=-sINITIAL_MEMORY=$(INITIAL_MEMORY)\
	-sUSE_SDL=2\
	--emrun\
	--preload-file $(DIR)

bf16_web: index.html

index.html: bf16_web.c
	emcc $(CFLAGS) $(EMFLAGS) -o $@ $^

bf16: bf16.c
	$(CC) $(CFLAGS) -o $@ $^

bf16_grayscale: bf16_grayscale.c
	$(CC) $(CFLAGS) -o $@ $^ 

clean:
	rm -f bf16 bf16_grayscale index.html index.js
