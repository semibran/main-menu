import extract from "img-extract"
import Canvas from "../../lib/canvas"
import recolor from "../../lib/typeface-recolor"
import colors from "../palette"

export default function createFont(font) {
	let cache = { [colors.white]: {} }
	for (let char in font.charmap) {
		let rect = font.charmap[char]
		cache[colors.white][char] = extract(font.image, rect.x, rect.y + rect.offset, rect.width, rect.height)
	}
	return function Text(content, color = colors.white) {
		let typeface = cache[color]
		if (!typeface) {
			typeface = cache[color] = recolor(cache[colors.white], color)
		}
		let width = -font.kerning
		let height = 0
		for (let char of content) {
			let data = font.charmap[char]
			let sprite = typeface[char] || typeface[char.toUpperCase()]
			if (!sprite) {
				width += font.space
			} else {
				let y = data ? data.offset : 0
				width += sprite.width + font.kerning
				height = Math.max(height, sprite.height + y)
			}
		}
		let text = Canvas(width, height)
		let x = 0
		for (let char of content) {
			let data = font.charmap[char]
			let sprite = typeface[char] || typeface[char.toUpperCase()]
			if (!sprite) {
				x += font.space
			} else {
				let y = data ? data.offset : 0
				text.drawImage(sprite, x, y)
				x += sprite.width + font.kerning
			}
		}
		return text.canvas
	}
}
