import {Router} from "express";
import {Request} from "express";
import {Response} from "express";
import {NextFunction} from "express";
import {FileLoader, ListRes} from "./file-loader";
import {GoogleAuth, AuthOptions} from './google-auth';


export interface IConfig {
    google: AuthOptions;
    mimeTypes: string[];
}


/**
 * Google Drive module with NodeJS (ExpressJS) server
 */
export class GoogleDriveModule {
    googleAuth: GoogleAuth;
    fileLoader: FileLoader;
    config: IConfig;

    constructor(config: IConfig) {
        this.config = config;
        this.googleAuth = new GoogleAuth(config.google);
        this.fileLoader = new FileLoader(this.googleAuth.getOauth2Client());
    }


    routes(api: Router) {
        api.get('/auth', (req, res, next) => {
            this.getAuthUrl(req, res, next);
        });
        api.get('/token', (req, res, next) => {
            this.getCodeToken(req, res, next);
        });
        api.get('/list', (req, res, next) => {
            this.list(req, res, next);
        });
       /* api.get('/txt/:id', (req, res, next) => {
            this.getTxtContent(req, res, next);
        });*/
    }

    getCodeToken(req: Request, res: Response, next: NextFunction): any {
        this.googleAuth.getToken(req.query.code)
            .then((token: any) => {
                res.json(token);
            })
            .catch((err: Error) => {
                console.log(err);
                res.status(401).json({error: err.message});
            });
    }

    /*getTxtContent(req: Request, res: Response, next: NextFunction): any {
        this.fileLoader.getTxtContent(req.params.id)
            .then((content) => {
                res.send(content);
            })
            .catch((err: Error) => {
                console.log(err);
                res.status(400).json({error: err.message});
            });
    }*/

    list(req: Request, res: Response, next: NextFunction): any {
        let options = {
            nextPageToken: req.query.nextPageToken,
            mimeTypes: this.config.mimeTypes
        };

        this.fileLoader.loadPageFiles(options)
            .then((listRes: ListRes) => {
                res.json(listRes);
            })
            .catch((err: Error) => {
                console.log(err);
                res.status(400).json({error: err.message});
            });
    }

    getAuthUrl(req: Request, res: Response, next: NextFunction): any {
        var authUrl = this.googleAuth.getAuthUrl();
        res.send(authUrl);
    }
}


