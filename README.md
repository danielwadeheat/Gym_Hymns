# Workout Music Search App

A junior-friendly portfolio project built with **HTML, CSS, and JavaScript**.

## What this project demonstrates

- `fetch()` to load track data from a local JSON file
- DOM rendering with `querySelector`, template cloning, and `innerHTML`
- filtering by search input and workout category
- saving favorites with `localStorage`
- responsive layout and modern card-based UI
- clear separation of HTML, CSS, JavaScript, and JSON data

## Why this version is smart for a junior portfolio

> I built this because music and training are both a big part of my life. I wanted to practice fetch API, DOM rendering, filtering, and saving user choices with localStorage.

## Main features

- search by **artist**, **song**, or **album**
- see generated album-art style cover cards, song title, artist name, and album name
- click **Find Track** to open the song search in a new tab
- save songs into **My Workout Picks**
- filter saved picks by:
  - Warm-Up
  - Heavy Lifting
  - Heaviest Lifting
  - Motivational/Uplifting
  - Cardio
  - Focus
  - Recovery
  - Endurance

## How it works

- `tracks.json` contains the starter data.
- `app.js` fetches that file and renders cards.
- users can search by artist, title, or album.
- users can save tracks into custom workout categories.
- saved picks stay in the browser with `localStorage`.

## Easy upgrade ideas later

- replace the local JSON file with a real music API
- add sort buttons (A–Z or category)
- let users edit a saved category after saving
- add a dark/light theme switcher
- add a small stats area that shows how many songs are saved in each category
