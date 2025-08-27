class CString
{
	#m_offset;
	#m_size;
	#m_data;

	constructor(offset, str)
	{
		this.#m_offset = offset
		this.#m_size = str.length

		this.#m_data = new Uint8Array(this.#m_size + 1);
		this.#m_data.set(new TextEncoder().encode(str));
	}

	data()
	{
		return this.#m_offset;
	}

	size()
	{
		return this.#m_size;
	}

	at(index)
	{
		return this.#m_data[index]
	}
}

class bf16 extends p5jsc
{
	sketchName = "./bf16.wasm";

	canvasId = "BF16-Renderer";
	nodeId = "BF16-Main";

	memory;

	strlen(mem_offset)
	{
		let offset = 0 
		const view = new DataView(this.memory.buffer, mem_offset)
		while (view.getUint8(offset++) != 0)
			if (view.getUint8(offset) == 0) return offset;
	}

	toString(mem_offset)
	{
		return new TextDecoder("UTF-8").decode(new Uint8Array(this.memory.buffer, mem_offset, this.strlen(mem_offset)))
	}

	logjs(cstr)
	{
		console.log(this.toString(cstr))
	}

	constructor()
	{
		super()

		this.memory = new WebAssembly.Memory({initial: 1024})

		this.program = "+[.>+<->]"
		this.program = "+[.>+]"
	}

	run()
	{
		const cstring = new CString(16384, this.program)
		const view = new DataView(this.memory.buffer, cstring.data(), cstring.size())
		for (let i = 0; i < cstring.size(); i += 1) view.setUint8(i, cstring.at(i))
		this.exports.runProgram(cstring.data(), cstring.size())
	}

	ready()
	{
		const button = document.getElementById("program")
		button.addEventListener("click", this.run)
		button.value = this.program
	
		this.run()
	}
}
