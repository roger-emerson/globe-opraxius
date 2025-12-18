# Opraxius Globe

Interactive globe visualization that displays website visitor locations in real-time.

## How It Works

Each time someone visits the page, a WebSocket connection is opened with a Durable Object that manages the state of the globe. Visitors are placed on the globe based on the geographic location of their IP address.

When a new connection is established, the Durable Object broadcasts the location of the new visitor to all other active visitors, and the client adds the new visitor to the globe visualization. When someone leaves the page, the Durable Object broadcasts their removal.

## Getting Started

1. Install the project dependencies:
   ```bash
   npm install
   ```

2. Run locally for development:
   ```bash
   npm run dev
   ```

3. Deploy to Cloudflare:
   ```bash
   npm run deploy
   ```

## Tech Stack

- Cloudflare Workers
- Durable Objects
- WebSockets
- React
