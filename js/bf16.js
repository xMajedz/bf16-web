let instance = {}

const memory = new WebAssembly.Memory({initial: 512})
const strlen = mem_offset => {
	let offset = 0 
	const view = new DataView(memory.buffer, mem_offset)
	while (view.getUint8(offset) != 0) offset += 1;
	return offset

}

const toString = mem_offset => {
	console.log(new Uint8Array(memory.buffer, mem_offset, strlen(mem_offset)))
	return new TextDecoder("utf-8").decode(new Uint8Array(memory.buffer, mem_offset, strlen(mem_offset)))
}

const toCString = str => {
	const bytes = new Uint8Array(str.length + 1);
	bytes.set(new TextEncoder().encode(str))
	return bytes
}

let node = document.getElementById("BF16-Main")
let canvas = document.getElementById("BF16-Renderer")
	
const p5Imp = {
	env: {
		memory: memory, 

		createCanvas: (width, height, context) => {
			instance.createCanvas(width, height, context ? "webgl" : "p2d", canvas)
		},
		background: color => instance.background(color),
		noStroke: () => instance.noStroke(),
		fill: color => instance.fill(color),
		fillrgb: (r, g, b) => instance.fill(r, g, b),
		circle: (x, y, d) => instance.circle(x, y, d),
		rect: (x, y, w, h) => instance.rect(x, y, w, h),
		deltaTime: () => 0.001*instance.deltaTime,
		logjs: mem_offset => {
			console.log(mem_offset.toString(16).replace(/^/, "0x"), toString(mem_offset))
		}
	}
}

class bf16
{
	constructor()
	{
		this.start();
	}

	async start() {
		const {instance: wasm} = await WebAssembly.instantiateStreaming(fetch("./bf16.wasm"), p5Imp);
		console.log(wasm)
		const {preload, setup, draw, runProgram} = wasm.exports
		const sketch = pInst => {
			pInst.preload = preload
			pInst.setup = setup
			pInst.draw = draw
			instance = pInst
		}
	
		node = document.getElementById("BF16-Main")
		canvas = document.getElementById("BF16-Renderer")
	
		new p5(sketch, node)
	
		const run = () => {
			const offset = 16384
			const cstring = toCString(document.getElementById("program").value)
			const view = new DataView(memory.buffer, offset, cstring.length)
			for (const i of cstring.keys()) view.setUint8(i, cstring[i])
	
			runProgram(offset, cstring.length - 1)
		}
	
		document.getElementById("runProgram").addEventListener("click", run); 
	
		run()
	}
}
