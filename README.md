# Google Drive Connector
Dev Task Connector to google drive

## Instalation and Run

Dillinger requires [Node.js](https://nodejs.org/) v4+ to run.

Download and extract the [latest release](https://github.com/jioxmatik/ggleconn).

Open this project with console and install dependencies and globals.

```sh
$ npm install -g typescript
$ npm install -g typings
$ cd ggleconn
$ npm install
```

Configure config.json file
```javascript
{
  "google":{
    "clientId": "<Google Drive API client ID code>",
    "clientSecret": "<Google Drive API Client secret code>",
    "back": "http://localhost:3000/back.html"
  },
  //Google drive Files mime types to check
  "mimeTypes": [
    "text/plain",
    "application/vnd.google-apps.document",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ]
}
```
And Run server

```sh
$ npm start
```

Open brawser and watch http://localhost:3000

### Tech

THIS Project use:
* [Express] - fast node.js network app framework
* [jQuery] - duh
* [TypeScript] - Good code programing


### THE END


