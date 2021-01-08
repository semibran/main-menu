export default function normalize(image) {
	for (var i = 0; i < image.data.length; i += 4) {
		if (image.data[i + 3] < 128) {
			image.data[i + 3] = 0
		} else {
			image.data[i + 3] = 255
		}
	}
}
