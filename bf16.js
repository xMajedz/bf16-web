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
			for (let i = 0; i < this.#m_size; i += 1) view.setUint8(i, bytes[i])
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

		//this.program = "+[.>+<->]"
		//+(128)[.>+(128)<-(128)>]
		this.program = "++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++[.>++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++<-------------------------------------------------------------------------------------------------------------------------------->]"

		//this.program = "+[.>+]"
		//+(128)[.>+(128)]
		this.program = "++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++[.>++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++]"
	}

	grayscale()
	{
		return 0 + document.getElementById("grayscale").checked
	}

	logjs(cstring)
	{
		console.log(new Uint8Array(this.memory.buffer, cstring))
		console.log(new CString(cstring, this.memory.buffer).toString())
	}

	run()
	{
		const cstring = new CString(16385, this.memory.buffer, document.getElementById("program").value)
		this.exports.runProgram(cstring.data(), cstring.size())
	}

	ready()
	{
		document.getElementById("program").value = this.program
		document.getElementById("runProgram").addEventListener("click", this.run.bind(this))
		this.run()
	}
}
