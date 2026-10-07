# bf16-web
bf16-web port.

# compiling
you need emscripten to compile this.

# running
run
```bash
make
```
or write this command directly
```bash
emcc -lSDL2 -lm -sUSE_SDL=2 --emrun --preload-file examples
```
host a server
```bash
npx http-server 
or
python -m http.server
```
open `localhost:8000 or localhost:8080` in your browser of choice

open `localhost:8080/?examples/badapple.b` for a diffrent exmaple.