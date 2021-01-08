import generateCharmap from "../../lib/charmap.js"

const cols = 10
const width = 6
const height = 9
const order =
	"0123456789" +
	"ABCDEFGHIJ" +
	"KLMNOPQRST" +
	"UVWXYZ.!?-" +
	"abcdefghij" +
	"klmnopqrst" +
	"uvwxyz"

let charmap = generateCharmap(order, cols, width, height)

export default {
	name: "6x9",
	charmap: charmap,
	kerning: 1,
	space: 3
}
