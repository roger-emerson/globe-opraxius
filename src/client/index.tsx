import "./styles.css";

import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import createGlobe from "cobe";
import usePartySocket from "partysocket/react";

// The type of messages we'll be receiving from the server
import type { OutgoingMessage } from "../shared";
import type { LegacyRef } from "react";

function App() {
	// A reference to the canvas element where we'll render the globe
	const canvasRef = useRef<HTMLCanvasElement>();
	// The number of markers we're currently displaying
	const [counter, setCounter] = useState(0);
	// A map of marker IDs to their positions
	// Note that we use a ref because the globe's `onRender` callback
	// is called on every animation frame, and we don't want to re-render
	// the component on every frame.
	const positions = useRef<
		Map<
			string,
			{
				location: [number, number];
				size: number;
			}
		>
	>(new Map());
	// Connect to the PartyServer server
	const socket = usePartySocket({
		room: "default",
		party: "globe",
		onMessage(evt) {
			const message = JSON.parse(evt.data as string) as OutgoingMessage;
			if (message.type === "add-marker") {
				// Add the marker to our map
				positions.current.set(message.position.id, {
					location: [message.position.lat, message.position.lng],
					size: 0.09,
				});
				// Update the counter
				setCounter((c) => c + 1);
			} else {
				// Remove the marker from our map
				positions.current.delete(message.id);
				// Update the counter
				setCounter((c) => c - 1);
			}
		},
	});

	useEffect(() => {
		let phi = 0;

		const globe = createGlobe(canvasRef.current as HTMLCanvasElement, {
			devicePixelRatio: 2,
			width: 800 * 2,
			height: 800 * 2,
			phi: 0,
			theta: 0,
			dark: 1.0,
			diffuse: 0.85,
			mapSamples: 16000,
			mapBrightness: 6.0,
			mapBaseBrightness: 0,
			baseColor: [0.235, 0.235, 0.235],
			markerColor: [0.133, 0.82, 0.408],
			glowColor: [1, 1, 1],
			markers: [],
			scale: 1.0,
			offset: [0, 0],
			opacity: 0.9,
			onRender: (state) => {
				// Called on every animation frame.
				// `state` will be an empty object, return updated params.

				// Get the current positions from our map
				state.markers = [...positions.current.values()];

				// Rotate the globe
				state.phi = phi;
				phi += 0.005;
			},
		});

		return () => {
			globe.destroy();
		};
	}, []);

	return (
		<div className="App">
			{/* Globe container with curved title */}
			<div className="globe-container">
				{/* Curved text arc above the globe */}
				<svg
					className="curved-title"
					viewBox="0 0 500 150"
					xmlns="http://www.w3.org/2000/svg"
				>
					<defs>
						<path
							id="textArc"
							d="M 50,140 Q 250,0 450,140"
							fill="none"
						/>
					</defs>
					<text fill="white" fontSize="42" fontWeight="600" letterSpacing="8">
						<textPath href="#textArc" startOffset="50%" textAnchor="middle">
							OPRAXIUS
						</textPath>
					</text>
				</svg>

				{/* The canvas where we'll render the globe */}
				<canvas
					ref={canvasRef as LegacyRef<HTMLCanvasElement>}
					style={{ width: 800, height: 800, maxWidth: "100%", aspectRatio: 1 }}
				/>
			</div>

			{counter !== 0 ? (
				<p>
					<b>{counter}</b> {counter === 1 ? "person" : "people"} connected.
				</p>
			) : (
				<p>&nbsp;</p>
			)}
		</div>
	);
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById("root")!).render(<App />);
