// Print/export helpers for the Impact Map. Step 4 extends this with the full export render.

// Grab the map's current frame as an image. Mapbox clears the WebGL drawing buffer after
// compositing, so the canvas must be read inside a render event rather than at an arbitrary time.
// This avoids having to create the map with preserveDrawingBuffer: true.
export function captureMapSnapshot(map) {
	return new Promise((resolve, reject) => {
		if (!map) {
			reject(new Error('Map is not available'));
			return;
		}

		map.once('render', () => {
			try {
				const canvas = map.getCanvas();
				resolve({
					dataUrl: canvas.toDataURL('image/png'),
					width: canvas.width,
					height: canvas.height
				});
			} catch (error) {
				reject(error);
			}
		});

		map.triggerRepaint();
	});
}
