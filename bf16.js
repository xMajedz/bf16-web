class CString
{
	#m_buffer;
	#m_offset;

	#m_size;

	constructor(offset, buffer, source)
	{
		this.#m_buffer = buffer
		this.#m_offset = offset

		if (source == undefined) {
			const view = new DataView(buffer)
			while (view.getUint8(offset) != 0) offset++;
			this.#m_size = offset - this.#m_offset
		}

		if (typeof source == "string") {
			const view = new DataView(buffer, offset)
			this.#m_size = source.length
			const bytes = new Uint8Array(this.#m_size + 1);
			bytes.set(new TextEncoder().encode(source));
			for (let i = 0; i < this.#m_size + 1; i += 1) view.setUint8(i, bytes[i])
		}
	}

	data()
	{
		return this.#m_offset;
	}

	size()
	{
		return this.#m_size;
	}

	toString()
	{
		return new TextDecoder("UTF-8").decode(new Uint8Array(this.#m_buffer, this.#m_offset, this.#m_size))
	}
}

class bf16 extends p5jsc
{
	sketchName = "./bf16.wasm";

	canvasId = "BF16-Renderer";
	nodeId = "BF16-Main";

	memory;

	constructor()
	{
		super()

		this.memory = new WebAssembly.Memory({initial: 1024})
	}

	grayscale()
	{
		return 0 + document.getElementById("grayscale").checked
	}

	println(fmt, args)
	{
		let res = new CString(fmt, this.memory.buffer).toString()

		for (let offset = args ;; offset += 4)
		{
			const i = new Uint32Array(this.memory.buffer, offset, 1)[0]

			if (new RegExp("%s").test(res)) {
				res = res.replace(new RegExp("%s"), new CString(i, this.memory.buffer).toString())
			} else if (new RegExp("%d").test(res)) {
				res = res.replace(new RegExp("%d"), i)
			} else {
				break
			}
		}

		console.log(res)
	}

	run()
	{
		const cstring = new CString(16385, this.memory.buffer, document.getElementById("program").value)
		this.exports.runProgram(cstring.data(), cstring.size())
	}

	async ready()
	{
		let example = new URLSearchParams(window.location.search).get("example") ?? "fill_canvas"
		const file = await fetch(`./examples/${example}.bf`)
		const reader = await file.body.getReader()
		const content = await reader.read()
		this.program = new TextDecoder("UTF-8").decode(content.value)
		document.getElementById("program").value = this.program
		document.getElementById("runProgram").addEventListener("click", this.run.bind(this))
		this.run()
	}
}
