# TSUNAMI MESSENGER

> *Motorcycle courier racing a tsunami through low-poly Japan.*

---

## What is this?

You are a motorcycle courier in a low-poly Japanese coastal city. A tsunami warning has just triggered. You have **3 minutes** to deliver evacuation notices to every marked location before the wave hits.

The city floods in real time — rising water blocks roads, forcing you to reroute on the fly. Other players appear as ghost couriers sharing the same doomed world.

**Win:** Deliver all notices before the wave engulfs the city.  
**Lose:** Time runs out — or the water reaches your bike.

---

## Current State

This project is **playable but incomplete**. It was built as an entry for VibeJam 2026 — discovered on April 26th, with 5 days left on the clock.

What works:
- Motorcycle movement and controls
- Low-poly city environment with roads and buildings
- Countdown timer (top left)
- Delivery objective tracker ("X left", top right)
- Wave progress bar (bottom)
- Delivery markers visible in the world (yellow indicators)
- Ghost courier multiplayer layer (via server/)

What's unfinished:
- Camera doesn't track the bike's movement properly
- No rising water / flood visuals yet
- Full level polish and balancing
- Sound design
- End screen / win-lose flow
- Mobile controls

---

## Play it

🔗 **[tsunami-messenger.vercel.app](https://tsunami-messenger.vercel.app)**  
*(Unfinished build — things may be broken)*

---

## Built with

- JavaScript (vanilla)
- HTML / CSS
- Vercel — hosting

---

## Running locally

```bash
git clone https://github.com/NEXUS-Lord/tsunami-messenger
cd tsunami-messenger
npm install
npm run dev
```

---

## Contributing

If something here interests you, feel free to pick it up. No formal process — just open a PR.

Good first issues to tackle:
- **Camera fix** — the camera does not properly follow the bike movement/rotation. This is the biggest gameplay blocker right now.
- **Water rising visuals** — the wave bar exists but there is no actual flood mesh rising in the world yet.
- **Win / lose screen** — there is no end state UI when the timer hits zero or all deliveries are done.
- **Sound** — engine noise, ambient city sounds, alert siren when the warning triggers.
- **Mobile controls** — on-screen joystick / touch input.

If you break something, that is fine too. It is already a jam build.

---

## Why publish an unfinished game?

Because unfinished things are still real things. The core loop is there, the world feels alive, and the concept holds up. Maybe it gets finished someday. Maybe it inspires someone else. Either way — it existed, so here it is.

---

*Made in a crunch. With vibes.*
