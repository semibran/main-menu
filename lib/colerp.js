import lerp from "./lerp"

export default function colerp(a, b, t) {
	return [
		lerp(a[0], b[0], t),
		lerp(a[1], b[1], t),
		lerp(a[2], b[2], t),
		lerp(a[3], b[3], t)
	]
}

