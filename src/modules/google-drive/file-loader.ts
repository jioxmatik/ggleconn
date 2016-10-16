import * as https from 'https';
import * as fs from 'fs';
import { IncomingMessage } from "http";

var google = require("googleapis");

export interface File {
    id: string;
    path?: string;
    name: string;
    parents?: string[];
    webContentLink: string;
    mimeType: string;
}
interface Folder {
    id: string;
    name: string;
    parents?: string[];
    mimeType: string;
}

export interface ListRes {
    files: File[];
    nextPageToken: string;
}

export interface FileListParams {
    mimeTypes: string[],
    nextPageToken?: string
}

export class FileLoader {
    drive: any;

    constructor(auth: any) {
        this.drive = google.drive({version: 'v3', auth: auth});
    }

    /**
     * Return Promise with google drive list response
     * @param {object} options Google drive list fields params
     * @param {string} options.mimeTypes Filters by file types for the mime Type params
     * @param {string} options.nextPageToken The next page token from prev google drive list response
     * @returns {Promise<ListRes>}
     */
    loadPageFiles(options: FileListParams): Promise<ListRes> {
        return new Promise((resolve, reject) => {
            let q = '';
            if (options.mimeTypes && Array.isArray(options.mimeTypes) && options.mimeTypes.length) {
                q = " and (mimeType contains '" + options.mimeTypes.join("' or mimeType contains '") + "')";
            }
            this.drive.files.list({
                orderBy: 'name asc',
                q: "trashed = false and mimeType != 'application/vnd.google-apps.folder'" + q,
                pageSize: 6,
                pageToken: options.nextPageToken || null,
                fields: 'nextPageToken, files'
            }, (err: any, res: ListRes) => {
                if (err) {
                    reject(new Error('The Google API returned an error: ' + err));
                    return;
                }
                resolve(res);
            });
        }).then((res: ListRes) => {
            return this.loadFilesPaths(res.files)
                .then((files: File[]) => {
                    res.files = files;
                    return res;
                })
        });
    }


    private loadPath(parentId: string, path: string): Promise<string> {
        return new Promise<Folder>((resolve, reject) => {
            this.drive.files.get({
                fileId: parentId,
                fields: 'id, name, parents'
            }, (err: any, folder: Folder) => {
                if (err) {
                    reject(new Error('The Google API returned an error: ' + err));
                    return;
                }
                resolve(folder);
            });
        }).then((folder: Folder) => {
            if (folder.parents && folder.parents.length > 0) {
                return this.loadPath(folder.parents[0], folder.name + '/' + path);
            } else {
                return folder.name + '/' + path;
            }
        });

    }

    private loadFilesPaths(files: File[], idx?: number): Promise<File[]> {
        if (idx === undefined) idx = 0;
        if (files.length > idx) {
            return this.loadFilePath(files[idx]).then((file: File) => {
                files[idx] = file;
                return this.loadFilesPaths(files, ++idx);
            });
        } else {
            return Promise.resolve(files);
        }
    }

    /**
     * Not work on google drive api v3
     */
    /*getTxtContent(fileId: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.drive.files.get({
                fileId: fileId,
                fields: 'id, name, webContentLink'
            }, (err: any, file: File) => {
                if (err) {
                    reject(new Error('The Google API returned an error: ' + err));
                    return;
                }
                let path = "tmp.txt";
                let f = fs.createWriteStream(path);
                https.get(file.webContentLink, (res: IncomingMessage) => {
                    res.pipe(f);
                    f.on('finish', () => {
                        f.close();
                        resolve(path);
                    }).on('error', (err: Error) => {
                        reject(err)
                    });
                });

            });
        }).then((path: string) => {
            return new Promise((resolve, reject) =>{
                fs.readFile(path, 'utf8', (err, data) => {
                    if(err){
                        reject(err);
                        return;
                    }
                    resolve(data);
                });
            });
        });
    }*/

    private loadFilePath(file: File): Promise<File> {
        return new Promise((resolve, reject) => {
            if (file.parents && file.parents.length > 0) {
                this.loadPath(file.parents[0], '')
                    .then((path: string) => {
                        file.path = path;
                        resolve(file);
                    }).catch(reject);
            } else {
                file.path = '';
                resolve(file);
            }
        });
    }

}