import generateCharmap from "../../lib/charmap.js"

const cols = 10
const width = 16
const height = 16
const order =
	"1234567890" +
	"ABCDEFGHIJ" +
	"KLMNOPQRST" +
	"UVWXYZ."

let charmap = generateCharmap(order, cols, width, height)
charmap["L"].width -= 1
charmap["T"].width -= 1
charmap["I"].width -= 4
charmap["."].width -= 8

export default {
	name: "16x16",
	charmap: charmap,
	kerning: -4,
	space: 6
}
