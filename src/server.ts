/// <reference path="../typings/index.d.ts" />

import {GoogleDriveModule, IConfig} from './modules/google-drive';

import * as express from 'express';
import {Server} from "http";


var app = express();

var gDriveRouter = express.Router();

var config: IConfig = require('../config.json');

var gDrive = new GoogleDriveModule(config);


gDrive.routes(gDriveRouter);

//noinspection TypeScriptValidateTypes
app.use('', express.static('public'));

//noinspection TypeScriptValidateTypes
app.use('/google', gDriveRouter);

var server: Server = app.listen(3000, () => {
    let port = server.address().port;
    console.log('Server running at http://localhost:%s', port);
});