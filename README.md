# fastify-websocket-server

A robust and scalable API built with Fastify and WebSocket for real-time communication
This project is a robust and scalable API built with Fastify and WebSocket for real-time communication. It supports private and public messaging, and includes features such as api-key authentication.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js
- npm

### Routes

- HTTP POST '/post' body JSON: {
  "id": "klaus",
  "message":"test"
  }
  Required header: http-access-key: string

### WebSocket Connection

- ws://localhost:8080/:id
  Required header: ws-access-key: string
