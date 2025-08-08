LD_FLAGS=
LD_FLAGS+= -Wl,--no-entry
LD_FLAGS+= -Wl,--allow-undefined
LD_FLAGS+= -Wl,--export=preload
LD_FLAGS+= -Wl,--export=setup
LD_FLAGS+= -Wl,--export=draw
LD_FLAGS+= -Wl,--export=runProgram
LD_FLAGS+= -Wl,--import-memory

src/bf16.wasm: src/bf16.c
	clang --no-standard-libraries --target=wasm32 -I. $(LD_FLAGS) -o $@ $^
