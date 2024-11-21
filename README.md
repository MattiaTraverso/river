# Rive TypeScript Game Framework

Hey! 👋 This is my attempt at building a game framework using [Rive](https://rive.app) as a renderer!

Fair warning: I'm learning TypeScript as I go, so expect some "interesting" code choices.


## What's This All About?

Rive is a wonderful tool, but:
A) Its high level JS api is WAY too high level to make a game with

B) Its low level JS api is WAY too low level for anyone to make a game with ( :D )

C) While empowering animators to build logic is AWESOME, it skews too much towards no-code solutions, and you need a healthy mix to make games!

If only there was a middle level api... :)

Tada! River is a 2D game engine that uses Rive for rendering, but with all of the scaffolding you expect from an engine: a Game Loop, Scene System, Asset Management, State Machines (the generic ones), etc...

When this is done you'll be able to make 2D games as you'd with LOVE2D, but with a Rive renderer.

It's partially a learning exercise and partially because I need it for a client project.


## Can I try it?

...kinda? Right now it's not yet ready for the public. I made the github repo public in case I need to submit bugs **😅**

If you want to try it out, you need to:
* Clone the Repo
* Using your favourite package manager, install the depencies (yarn install)
* Build it (yarn start)
* Try it and be very underwhelmed because there's no good showcase as to why we need this... yet!

If you wait a few weeks I should have something to show you to prove why this matters.

  

## Current State

- Naming conventions are all over the place
- TypeScript implementation is improving as I learn
- API might change as the framework evolves
- Documentation is a work in progress
- Claude's been helping out when I get lazy :)


## Planned Features

Looking to support standard game engine features:
- Tweens
- Physics integration
- Audio system
- Better Asset management (A .riv importer that figures out what you need)
- .. more!

## Usage

This is currently a personal work in progress, being developed alongside a client project. Feel free to explore, but expect frequent changes and updates.

**Note**: This is an active learning project. Feedback and suggestions are welcome!
