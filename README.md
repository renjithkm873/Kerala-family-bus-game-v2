# Kerala Family Bus Trip — Multiplayer

This version uses Node.js + Express + Socket.IO.

## What it does
- One shared family room
- No player account/login
- Maximum 15 simultaneous players
- Live player list and seat updates
- Shared trip location
- Tea shop, fishing, snacks and exploration activities
- Players start with virtual ₹1,000

## Run locally
Install Node.js 18+.
Then:
npm install
npm start
Open http://localhost:3000 on phones connected to the same computer/network.

## Put it online
Deploy this folder to a Node.js host such as Render, Railway, Fly.io, or another service supporting WebSockets. The public URL becomes the WhatsApp family-game link.

## Important
The current room is intentionally a single family room named FAMILY15. A production version can add a private room token/invite link while still keeping player login-free.

## Kerala world events in v2
The prototype now includes interactive scene switching for:
- Forest wildlife (elephant)
- Sea/coastal road
- Railway crossing with a passing train
- Village
- Spot-it reward (+₹100 virtual money)
