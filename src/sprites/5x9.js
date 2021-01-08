import generateCharmap from "../../lib/charmap.js"

const cols = 10
const width = 5
const height = 9
const order =
	"ABCDEFGHIJ" +
	"KLMNOPQRST" +
	"UVWXYZ.!?-" +
	"abcdefghij" +
	"klmnopqrst" +
	"uvwxyz"

let charmap = generateCharmap(order, cols, width, height)
charmap.j.y -= 3
charmap.j.height += 3
charmap.g.offset = 3
charmap.p.offset = 3
charmap.q.offset = 3
charmap.y.offset = 3
charmap.z.offset = 3
charmap.f.width = 4
charmap.i.width = 1
charmap.j.width = 2
charmap.k.width = 5
charmap.l.width = 1
charmap.t.width = 3
charmap["."].width = 1
charmap["!"].width = 1
charmap["-"].height -= 3

export default {
	name: "5x9",
	charmap: charmap,
	kerning: 1,
	space: 3
}
