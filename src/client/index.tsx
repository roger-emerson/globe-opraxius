import "./styles.css";

import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import createGlobe from "cobe";
import usePartySocket from "partysocket/react";

// The type of messages we'll be receiving from the server
import type { OutgoingMessage } from "../shared";
import type { LegacyRef } from "react";

// Player info for display
type PlayerInfo = {
	id: string;
	city: string;
	country: string;
};

function App() {
	// A reference to the canvas element where we'll render the globe
	const canvasRef = useRef<HTMLCanvasElement>();
	// List of connected players with their locations
	const [players, setPlayers] = useState<PlayerInfo[]>([]);
	// A map of marker IDs to their positions for the globe
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
				// Add player info to state
				setPlayers((prev) => [
					...prev,
					{
						id: message.position.id,
						city: message.position.city || "Unknown",
						country: message.position.country || "Unknown",
					},
				]);
			} else {
				// Remove the marker from our map
				positions.current.delete(message.id);
				// Remove player from state
				setPlayers((prev) => prev.filter((p) => p.id !== message.id));
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
			{/* Players online panel - top left */}
			<div className="players-panel">
				<div className="players-header">
					<span className="players-count">{players.length}</span>
					<span className="players-label">Online</span>
				</div>
				{players.length > 0 && (
					<ul className="players-list">
						{players.map((player) => (
							<li key={player.id}>
								<span className="player-dot" />
								{player.city}, {player.country}
							</li>
						))}
					</ul>
				)}
			</div>

			{/* Globe container with curved title overlay */}
			<div className="globe-container">
				{/* The canvas where we'll render the globe */}
				<canvas
					ref={canvasRef as LegacyRef<HTMLCanvasElement>}
					style={{ width: 800, height: 800, maxWidth: "100%", aspectRatio: 1 }}
				/>

				{/* Curved text arc overlaying the globe - 10px from circumference */}
				<svg
					className="curved-title-overlay"
					viewBox="0 0 800 800"
					xmlns="http://www.w3.org/2000/svg"
				>
					<defs>
						{/* Arc path hugging the globe's circumference, ~10px from edge */}
						<path
							id="textArc"
							d="M 60,400 A 340,340 0 0,1 740,400"
							fill="none"
						/>
					</defs>
					<text fill="white" fontSize="36" fontWeight="600" letterSpacing="10">
						<textPath href="#textArc" startOffset="50%" textAnchor="middle">
							OPRAXIUS
						</textPath>
					</text>
				</svg>
			</div>
		</div>
	);
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById("root")!).render(<App />);
