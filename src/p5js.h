#include <stdint.h>

#define P2D 0
#define WEBGL 1

void createCanvas(uint32_t width, uint32_t height, uint32_t context);
void background(uint32_t color);
void noFill();
void noStroke();

void fill(uint32_t color);
void fillrgb(uint32_t r, uint32_t g, uint32_t b);

void stroke();
void circle(uint32_t x, uint32_t y, uint32_t d);
void rect(uint32_t x, uint32_t y, uint32_t w, uint32_t h);

float deltaTime();
