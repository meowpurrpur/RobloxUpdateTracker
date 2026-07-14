# Roblox Update Tracker

A Discord bot that monitors Roblox client versions and sends notifications when new updates are detected.
The bot monitors Roblox client version channels, detects future releases through ZBeta.

## Add to your server

If you do not want to host your own instance of the bot, you can use the one hosted and managed by me! The bot should have 100% uptime so don't worry.
-> [Authorization Link](https://discord.com/oauth2/authorize?client_id=1526290601476231218)

## Features

- Monitors Roblox client version channels
- Detects upcoming updates through ZBeta
- Sends Discord embeds for new releases
- Detects version reverts
- Supports multiple Discord servers and alert channels
- Custom notification messages per alert channel
- Uses Discord slash commands for configuration

## Requirements

- Node.js 20+
- A Discord bot application

## Installation

Clone the repository:

```bash
git clone https://git.imtheo.lol/theo/RobloxUpdateTracker.git
cd RobloxUpdateTracker
```

1. Install dependencies:

```bash
npm install
```

2. Create your .env:

```bash
cp .env.example .env
```

3. Edit `.env`

4. Register slash commands:

```bash
npm run register-commands
```

5. Start the bot:

```bash
npm run build && npm run start
```

## Commands

### `/alert add`

Adds update alerts to the current channel.

Options:

- `channel`
  - The Roblox channel to monitor

- `message`
  - Optional custom message sent with the alert

Example:

```
/alert add channel:LIVE message:@everyone
```

### `/alert remove`

Removes alerts from the current channel.

Example:

```
/alert remove channel:LIVE
```

### `/alert list`

Lists configured alerts.

## Development

Run in development mode:

```bash
npm run dev
```

### Note

Pull requests and issues should be created on git.imtheo.lol, not GitHub.

## License

This project is licensed under the [MIT License](LICENSE).
