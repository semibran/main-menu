import generateCharmap from "../../lib/charmap.js"

const cols = 10
const width = 24
const height = 24
const order =
	"1234567890" +
	"ABCDEFGHIJ" +
	"KLMNOPQRST" +
	"UVWXYZ...." +
	"abcdefghij" +
	"klmnopqrst" +
	"uvwxyz"

let charmap = generateCharmap(order, cols, width, height)
charmap.c.width -= 4
charmap.d.width -= 4
charmap.e.width -= 4
charmap.l.width -= 18
charmap.o.width -= 4

export default {
	name: "24x24",
	charmap: charmap,
	kerning: 1,
	space: 0
}
