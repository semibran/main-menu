import extract from "img-extract"

export default function disassemble(spritesheet, sourcemap) {
	let sprites = {}
	for (let id in sourcemap) {
		if (Array.isArray(sourcemap[id])) {
			let [ x, y, w, h ] = sourcemap[id]
			sprites[id] = extract(spritesheet, x, y, w, h)
		} else {
			sprites[id] = disassemble(spritesheet, sourcemap[id])
		}
	}
	return sprites
}
