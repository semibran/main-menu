import extract from "img-extract"
import disassemble from "../../lib/disassemble"
import sourcemap from "../../dist/tmp/sprites.json"
import createFont from "./text"
import fonts from "./fonts"

export default function normalize(spritesheet) {
	let sprites = disassemble(spritesheet, sourcemap)
	return {
		tab: sprites.tab,
		box: (sprite => {
			return {
				topLeft: extract(sprite, 0, 0, 4, 4),
				topRight: extract(sprite, 8, 0, 4, 4),
				bottomLeft: extract(sprite, 0, 8, 4, 4),
				bottomRight: extract(sprite, 8, 8, 4, 4)
			}
		})(sprites.box),
		icons: sprites.icons,
		title: sprites.title,
		banner: sprites.banner,
		corner: sprites.corner,
		burst: (sprite => {
			let frames = []
			for (let x = 0; x < sprite.width; x += sprite.height) {
				frames.push(extract(sprite, x, 0, sprite.height, sprite.height))
			}
			return frames
		})(sprites.burst),
		Text: {
			default: createFont({ image: sprites["6x9"], ...fonts["6x9"] }),
			block: createFont({ image: sprites["6x10"], ...fonts["6x10"] }),
			display: createFont({ image: sprites["16x16"], ...fonts["16x16"] }),
			title: createFont({ image: sprites["24x24"], ...fonts["24x24"] }),
			thin: createFont({ image: sprites["5x9"], ...fonts["5x9"] })
		}
	}
}
