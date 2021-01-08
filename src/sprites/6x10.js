import generateCharmap from "../../lib/charmap.js"

const cols = 10
const width = 6
const height = 10
const order =
	"ABCDEFGHIJ" +
	"KLM#NOPQRS" +
	"TUVW#XYZ"

let charmap = generateCharmap(order, cols, width, height)
charmap.I.width = 2
charmap.M.width = 7
charmap.W.width = 7

export default {
	name: "6x10",
	charmap: charmap,
	kerning: 1,
	space: 3
}
