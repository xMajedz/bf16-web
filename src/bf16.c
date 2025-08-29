#include "p5js.h"

#define WINDOW_SIZE 512
#define PIXEL_SCALE (WINDOW_SIZE / 16)

void println(const char* fmt, ...);
uint32_t grayscale();

uint8_t validate[255] = { 0 };

typedef struct
{
	uint16_t* content;
	uint32_t  count;
	uint32_t  pos;
} lexer;

lexer l = { 0 };
uint16_t content[16777216] = { 0 };

uint8_t memory[30000] = { 0 };
uint32_t address = 0;

void interpretProgram()
{
	while (l.pos < l.count)
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
				l.pos -= l.content[l.pos++];
			} else {
				l.pos++;
			}
			break;
		case '[':
			if (0 == memory[address]) {
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
	for (int i = 0; i < 256; i += 1) memory[i] = 0;

	address = 0;

	l.pos = 0;
	l.count = 1;
	l.content[0] = 0;

	for (uint32_t i = 0; i < length; i += 1)
	{
		if (validate[program[i]]) {
			if (l.content[l.count - 1] != program[i]) {
				if (0 < l.content[l.count - 1]) {
					l.content[++l.count] = program[i];
					l.count++;
				} else {
					l.content[l.count - 1] = program[i];
				}

				if (program[i] != '[' && program[i] != ']') {
					l.content[l.count] = 0;
				} else if (program[i] == '[') {
					/*
					 * [(?)
					 */
				} else if (program[i] == ']') {
					/*
					 * ](jmpsz)
					 * [(jmpsz)
					 */
					int balance = 1;

					l.pos = l.count - 1;

					while (l.pos > 0 && balance > 0)
					{
						l.pos -= 2;
						if (l.content[l.pos] == '[') balance -= 1;
						if (l.content[l.pos] == ']') balance += 1;
					}

					uint32_t jmpsz = l.count - l.pos + 1;
					l.content[l.count] = jmpsz;
					l.content[l.pos + 1] = jmpsz;
				}
			}

			if (program[i] != '[' && program[i] != ']') l.content[l.count] += 1;
		}
	}

	l.pos = 0;
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

		if (grayscale()) {
			fill(color);
		} else {
			uint8_t r = (color & 0xE0) >> 5;
      			uint8_t g = (color & 0x1C) >> 2;
      			uint8_t b = (color & 0x03);
			fillrgb((r * 255) / 7, (g * 255) / 7, (b * 255) / 3);
		}

		rect((i % 16) * PIXEL_SCALE, (i / 16) * PIXEL_SCALE, PIXEL_SCALE, PIXEL_SCALE);
	}
}
