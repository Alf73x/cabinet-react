# SportCabinet React Frontend

Frontend for **SportCabinet**, a web application for viewing and analyzing sports statistics across seasons and territories.

The application provides tools for exploring sports data, comparing opponents, viewing summary tables, and analyzing team and competition statistics.

**Live:** https://www.sportcabinet.ru/

## Tech Stack

* React
* TypeScript
* Vite
* Material UI (MUI)
* React Router
* REST API
* Docker
* Nginx

## Architecture

SportCabinet consists of several components:

* **Frontend:** React / TypeScript
* **Backend:** Go REST API
* **Database:** SQLite
* **Desktop application:** Delphi
* **Deployment:** Ubuntu Linux, Docker, Docker Compose, Nginx, HTTPS

The frontend communicates with the Go backend through a REST API.

## Features

* Sports statistics by season and territory
* Opponent comparison
* Summary tables
* Team and competition navigation
* Responsive desktop and mobile interface
* REST API integration
* JWT authentication support

## Backend

The SportCabinet backend is implemented in Go using chi, REST API, and SQLite.

## Deployment

The application is containerized with Docker and deployed on Ubuntu Linux behind Nginx with HTTPS.

## Status

SportCabinet is under active development. New statistics and analysis features are being added.
