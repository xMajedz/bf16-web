#include "p5js.h"

#define WINDOW_SIZE 512
#define PIXEL_SCALE (WINDOW_SIZE / 16)
#define MEMORY_SIZE 30000

uint8_t memory[MEMORY_SIZE];
uint32_t address = 0;

uint8_t validate[255] = { 0 };

void logjs(const char* msg);

typedef struct lexer_op
{
	struct lexer_op* jmp;
	uint32_t pos;
	uint8_t op;
} lexer_op;

typedef struct
{
	uint8_t* content;
	uint32_t pos;
	uint32_t op_count;
} lexer;

lexer l = { 0 };
uint8_t content[16777216] = { 0 };

void interpretProgram()
{
	while (l.pos < l.op_count)
	{
		switch(l.content[l.pos++])
		{
		case '.':
			l.pos++;
			return;
		case ',':
			l.pos++;
			break;
		case ']':
			if (0 != memory[address]) {
				//for (l.content[l.pos] != '[') l.pos--;
				l.pos -= l.content[l.pos++];
			} else {
				l.pos++;
			}
			break;
		case '[':
			if (0 == memory[address]) {
				//for (l.content[l.pos] != ']') l.pos++;
				l.pos += l.content[l.pos++];
			} else {
				l.pos++;
			}
			break;
		case '>':
			address += l.content[l.pos++];
			break;
		case '<':
			address -= l.content[l.pos++];
			break;
		case '+':
			memory[address] += l.content[l.pos++];
			break;
		case '-':
			memory[address] -= l.content[l.pos++];
			break;
		}
	}
}

void runProgram(const char* program, uint32_t length)
{
	logjs(program);

	address = 0;
	for (int i = 0; i < 256; i += 1) memory[i] = 0;

	l.pos = 0;
	l.op_count = 1;
	l.content[0] = 0;

	uint32_t jmp = 0;
	uint32_t jmpsz = 0;

	uint32_t balance = 0;
	uint32_t i = 0;

	while (i < length)
	{
		if (validate[program[i]]) {
			if (l.content[l.op_count - 1] != program[i]) {
				if (0 < l.content[l.op_count - 1]) {
					l.content[++l.op_count] = program[i];
					l.op_count++;
				} else {
					l.content[l.op_count - 1] = program[i];
				}

				if (program[i] == '[') {
					jmp = 1;
					balance += 1;
				} else if (program[i] == ']') {
					jmp = 0;
					balance -= 1;
					l.content[l.op_count] = jmpsz;
				} else {
					l.content[l.op_count] = 0;
				}

				if (jmp) jmpsz += 2;
			}

			l.content[l.op_count] += 1;
		}
		i++;
	}

	if (0 != balance) logjs("Unbalanced loop");
}

void preload() 
{
	validate['.'] = 1;
	validate[','] = 1;
	validate[']'] = 1;
	validate['['] = 1;
	validate['+'] = 1;
	validate['-'] = 1;
	validate['>'] = 1;
	validate['<'] = 1;

	l.content = content;
}

void setup() 
{
	createCanvas(WINDOW_SIZE, WINDOW_SIZE, P2D);
}

void draw()
{
	interpretProgram();

	noStroke();
	for (int i = 0; i < 256; i += 1) {
		uint8_t color = memory[i];
		uint8_t r = (color & 0xE0) >> 5;
      		uint8_t g = (color & 0x1C) >> 2;
      		uint8_t b = (color & 0x03);
		fillrgb((r * 255) / 7, (g * 255) / 7, (b * 255) / 3);
		rect((i % 16) * PIXEL_SCALE, (i / 16) * PIXEL_SCALE, PIXEL_SCALE, PIXEL_SCALE);
	}
}
