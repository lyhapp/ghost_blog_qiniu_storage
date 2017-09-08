'use strict';

const path = require('path');
const fs = require('fs');
const util = require('util');
const urlParse = require('url').parse;
const Promise = require('bluebird');
const moment = require('moment');
const qn = require('qn');
const StorageBase = require('ghost-storage-base');

const cwd = process.cwd();
let ghostRoot;

if (fs.existsSync(path.join(cwd, 'core'))) {
    ghostRoot = cwd;
} else if (fs.existsSync(path.join(cwd, 'current'))) {
    // installed via ghost cli
    ghostRoot = path.join(cwd, 'current');
}

if (!ghostRoot) {
    throw new Error('Can not get ghost root path!');
}

const config = require(path.join(ghostRoot, 'core/server/config'));
const utils = require(path.join(ghostRoot, 'core/server/utils'));
const errors = require(path.join(ghostRoot, 'core/server/errors'));
const i18n = require(path.join(ghostRoot, 'core/server/i18n'));
const getHash = require('./lib/getHash');
const logPrefix = '[QiniuStorage]';

class QiniuStorage extends StorageBase {
    constructor(options) {
        super(options);

        this.options = options || {};
        this.client = qn.create(this.options);
        this.storagePath = config.getContentPath('images');
    }

    /**
     * Saves the image to storage
     * - image is the express image object
     * - returns a promise which ultimately returns the full url to the uploaded image
     *
     * @param file
     * @param targetDir
     * @returns {*}
     */
    save(file, targetDir) {
        const client = this.client;
        const _this = this;

        return new Promise(function(resolve, reject) {
            _this.getFileKey(file).then((function(key) {
                client.upload(fs.createReadStream(file.path), {
                    key: key
                }, function(err, result) {
                    console.log(logPrefix, result);
                    // console.log('[' + err.code + '] ' + err.name);
                    err ? reject(err) : resolve(result.url);
                });
            }));
        });
    }

    exists(filename, targetDir) {
        return new Promise(function(resolve, reject) {
            resolve(false);
        });
    }

    serve() {
        // a no-op, these are absolute URLs
        return function(req, res, next) {
            next();
        };
    }

    delete(fileName, targetDir) {
        // return Promise.reject('not implemented');
        return new Promise(function(resolve, reject) {
            resolve(true);
        });
    }

    read(options) {
        options = options || {};

        const client = this.client;
        const key = urlParse(options.path).pathname.slice(1);

        return new Promise(function(resolve, reject) {
            client.download(key, function(err, content, res) {
                if (err) {
                    return reject(new errors.GhostError({
                        err: err,
                        message: `${logPrefix} Could not read image: ${options.path}`,
                    }));
                }

                resolve(content);
            });
        });
    }

    getFileKey(file) {
        const keyOptions = this.options.fileKey;
        let fileKey = null;

        if (keyOptions) {
            const getValue = function(obj) {
                return typeof obj === 'function' ? obj() : obj;
            };
            const ext = path.extname(file.name);
            let basename = path.basename(file.name, ext);
            let prefix = '';
            let suffix = '';
            let extname = '';

            if (keyOptions.prefix) {
                prefix = moment().format(getValue(keyOptions.prefix))
                    .replace(/^\//, '');
            }

            if (keyOptions.suffix) {
                suffix = getValue(keyOptions.suffix);
            }

            if (keyOptions.extname !== false) {
                extname = ext.toLowerCase();
            }

            const contactKey = function(name) {
                return prefix + name + suffix + extname;
            };

            if (keyOptions.hashAsBasename) {
                return getHash(file).then(function(hash) {
                    return contactKey(hash);
                });
            } else if (keyOptions.safeString) {
                basename = utils.safeString(basename);
            }

            fileKey = contactKey(basename);
        }

        return Promise.resolve(fileKey);
    }
}

module.exports = QiniuStorage;