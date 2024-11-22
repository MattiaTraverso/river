# Rive TypeScript Game Framework

Hey! 👋 This is my attempt at building a game framework using [Rive](https://rive.app) as a renderer!

> ⚠️ **Fair warning**: Rive works but it is **NOT** READY FOR PUBLIC USE. It still needs a ton of work before you can ship a game with it!

## What's This All About?

Rive is a wonderful tool, but:

1. Its high level JS api is WAY too high level to make a game with
2. Its low level JS api is WAY too low level for anyone to make a game with ( :D )
3. While empowering animators to build logic is AWESOME, it skews too much towards no-code solutions, and you need a healthy mix to make games!

**If only there was a middle level api... :)**

Enter **River**: a 2D game engine that uses Rive for rendering, but with all of the scaffolding you expect from an engine:
- Game Loop
- Scene System
- Asset Management
- State Machines (the generic ones)
- And more!

When this is done you'll be able to make 2D games as you'd with LOVE2D, but with a Rive renderer.

*It's partially a learning exercise and partially because I need it for a client project.*

## Can I try it?

...kinda? Right now it's not yet ready for the public. I made the github repo public in case I need to submit bugs **😅**

### Quick Start
1. Clone the Repo
2. Install dependencies: `yarn install`
3. Build it: `yarn start`
4. Try it and be very underwhelmed because there's no good showcase as to why we need this... yet!

> 💡 If you wait a few weeks I should have something to show you to prove why this matters.

## Current State

- ⚠️ API might change as the framework evolves
- 📝 Documentation is a non-existent
- 🎓 I'm learning TypeScript as I go, so expect some "interesting" code choices

## Planned Features

Looking to support standard game engine features:

- ⏱️ Tweens (UPDATE: IN!)
- 🎯 Physics integration
- 🔊 Audio system
- 📦 Better Asset management (A .riv importer that figures out what you need)
- ✨ ... more!

## Usage

This is currently a personal work in progress, being developed alongside a client project. Feel free to explore, but expect frequent changes and updates.
🤖 Claude's been helping out when I get lazy :)

> **Note**: This is an active learning project. Feedback and suggestions are welcome!
