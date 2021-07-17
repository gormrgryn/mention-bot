<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
<!--
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]
-->

<!-- PROJECT LOGO -->
<br />
<p align="center">
  <h3 align="center">mention-bot</h3>
  <p align="center">
    Mention Bot for Telegram
    <br />
    <a href="https://github.com/gormrgryn/mention-bot">View Demo</a>
    ·
    <a href="https://github.com/gormrgryn/mention-bot/issues">Report Bug</a>
    ·
    <a href="https://github.com/gormrgryn/mention-bot/issues">Request Feature</a>
  </p>
</p>



<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary><h2 style="display: inline-block">Table of Contents</h2></summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li><a href="#installation">Instalation</a></li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#commands">Commands</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

Mention Bot for Telegram group chats with auto adding a user to call-list.
### Built with
<ul>
  <li><a href="https://nodejs.org/">Node.js</a></li>
  <li><a href="https://expressjs.com">Express</a></li>
  <li><a href="https://telegraf.js.org">Telegraf</a></li>
  <li><a href="https://firebase.google.com">Firebase</a></li>
</ul>

## Installation
1. Clone the repository
```sh
   git clone https://github.com/gormrgryn/mention-bot.git
   ```
2. Install all the dependencies
```sh
   npm i
   ```
3. Run the project
 ```sh
   npm run start
   ```
## Usage

1. Get API key from BotFather in Telegram
2. Create json database (at Firebase)
3. Create ".env" file
4. Add data to ".env" file
 ```sh
    BOT_API_TOKEN=
    DB_ADDRESS=
    API_KEY=
    AUTH_DOMAIN=
    DB_URL=
    APP_ID=
    messagingSenderId=
    measurementId=
    PASS=
   ```
5. Start the project
6. Add bot to any group chat and give him admin status
7. Type something to get added into call list

## Commands

1. /add username - add user to the call list
2. /rm username or first name - remove user from the call list
3. /all message - send a message and mention all the members of the call list

<!-- CONTACT -->
## Contact

Your Name - [@_gormargaryan](https://twitter.com/_gormargaryan) - margaryan.gor.55@gmail.com

Project Link: [https://github.com/gormrgryn/mention-bot](https://github.com/gormrgryn/mention-bot)
