/*
    Based on: https://github.com/ioBroker/ioBroker.socketio/blob/master/example/conn.js
    Original license (MIT) & copyright notice: https://github.com/ioBroker/ioBroker.socketio/blob/master/LICENSE
    Original version by: GermanBluefox, Apollon77, jogibear9988
    
    Adaption for usage with "Secured Smart Home" by: Robert Mecke

    The content of this file is used to establish a websocket connection between webservice and smart home instance (ioBroker).
*/

import { readFileSync } from 'fs';
import * as io from 'socket.io-client';
import fs from 'fs';
import path from 'path';
import { LogLevel, loggingController } from '../controllers/loggingController';

export class IoBrokerSocket {
    _socket =            null;
    _onConnChange =      null;
    _onUpdate =          null;
    _isConnected =       false;
    _disconnectedSince = null;
    _connCallbacks =     {
        onConnChange:   null,
        onUpdate:       null,
        onRefresh:      null,
        onAuth:         null,
        onCommand:      null,
        onError:        null,
        onObjectChange: null
    };
    _authInfo =          null;
    _isAuthDone =        false;
    _isAuthRequired =    false;
    _authRunning =       false;
    _cmdQueue =          [];
    _connTimer =         null;
    _type =              'socket.io'; // [SignalR | socket.io | local]
    _timeout =           0;          // 0 - use transport default timeout to detect disconnect
    _reconnectInterval = 10000;       // reconnect interval
    _reloadInterval =    30;          // if connection was absent longer than 30 seconds
    _cmdData =           null;
    _cmdInstance =       null;
    _isSecure =          false;
    _defaultMode =       0x644;
    _useStorage =        false;
    _objects =           null;        // used if _useStorage === true
    _enums =             null;        // used if _useStorage === true
    _autoSubscribe =     true;
    namespace =          'vis.0';
    _user = null;
    _timer = null;
    _lastTimer = null;
    _connectInterval = null;
    _countDown = null;
    _countInterval = null;
    gettingStates = 0;
    _groups = null;

    constructor(connOptions, connCallbacks, objectsRequired, autoSubscribe) { 
        this.init(connOptions,connCallbacks,objectsRequired,autoSubscribe);
    }

    getType() {
        return this._type;
    }

    getIsConnected() {
        return this._isConnected;
    }

    getIsLoginRequired() {
        return this._isSecure;
    }

    getUser() {
        return this._user;
    }

    setReloadTimeout(timeout){
        this._reloadInterval = parseInt(timeout, 10);
    }
    
    setReconnectInterval(interval){
        this._reconnectInterval = parseInt(interval, 10);
    }

    _checkConnection(func, _arguments) {
        if (!this._isConnected) {
            loggingController.createLog(undefined, LogLevel.INFO,`ioBroker WebSocket: No connection!`);
            return false;
        }

        if (this._queueCmdIfRequired(func, _arguments)) {
            return false;
        }

        //socket.io
        if (this._socket === null) {
            loggingController.createLog(undefined, LogLevel.WARN,`ioBroker WebSocket: socket.io not initalized!`);
            return false;
        } else {
            return true;
        }
    }

    _monitor() {
        if (this._timer) {
            return;
        }

        var ts = Date.now();
        if (this._reloadInterval && ts - this._lastTimer > this._reloadInterval * 1000) {
            // It seems, this PC was in a sleep => Reload page to request authentication anew
            // this.reload();
        } else {
            this._lastTimer = ts;
        }

        this._timer = setTimeout(function () {
            this._timer = null;
            this._monitor();
        }, 10000);
    }

    _onAuth(objectsRequired, isSecure) {
        const that = this;

        this._isSecure = isSecure;

        if (this._isSecure) {
            this._lastTimer = Date.now();
            this._monitor();
        }

        this._autoSubscribe && this._socket.emit('subscribe', '*');
        objectsRequired && this._socket.emit('subscribeObjects', '*');

        if (this._isConnected === true) {
            // This seems to be a reconnect because we're already connected!
            // -> prevent firing onConnChange twice
            return;
        }

        this._isConnected = true;
        if (this._connCallbacks.onConnChange) {
            setTimeout(function () {
                that._socket.emit('authEnabled', function (auth, user) {
                    that._user = user;
                    that._connCallbacks.onConnChange(that._isConnected);
                });
            }, 0);
        }
    }

    reconnect(connOptions) {
        const that = this;
        
        // reconnect
        if ((!connOptions.mayReconnect || connOptions.mayReconnect()) && !this._connectInterval) {
            this._connectInterval = setInterval(function () {
                loggingController.createLog(undefined, LogLevel.INFO,`ioBroker WebSocket: Trying connect...`);
                
                that._socket.connect();
                that._countDown = Math.floor(that._reconnectInterval / 1000);
            }, this._reconnectInterval);

            this._countDown = Math.floor(this._reconnectInterval / 1000);

            this._countInterval = setInterval(function () {
                that._countDown--;
            }, 1000);
        }
    }

    init(connOptions, connCallbacks, objectsRequired, autoSubscribe) {
        const that = this;

        connOptions = connOptions || {};
        if (!connOptions.name) {
            connOptions.name = this.namespace;
        }

        if (autoSubscribe !== undefined) {
            this._autoSubscribe = autoSubscribe;
        }

        this._connCallbacks = connCallbacks;

        var connLink = connOptions.connLink;

        connOptions.socketSession = connOptions.socketSession || 'nokey';

        var url = connLink;

        // Get self signed cert
        let keyFile = undefined;
        let crtFilePath = "../../ssl_certificate/iobroker_cert.pem";
        let crtFileExists = fs.existsSync(path.resolve(__dirname, crtFilePath));
        if (!crtFileExists) {
            // If not found, try a folder above
            crtFilePath = "../../../ssl_certificate/iobroker_cert.pem";
            crtFileExists = fs.existsSync(path.resolve(__dirname, crtFilePath));
        }
        if (crtFileExists) {   
            keyFile = readFileSync(path.resolve(__dirname, crtFilePath));
        }

        this._socket = io.connect(url, {
            query: {
                key: connOptions.socketSession
            },
            reconnection:                   false,
            upgrade:                        false,
            rememberUpgrade:                false,
            transports:                     undefined,
            secure:                         true,
            withCredentials:                true,
            ca:                             keyFile,
            rejectUnauthorized:             false
        });

        this._socket.on("connect_error", (err) => {
            loggingController.createLog(undefined, LogLevel.ERROR,`ioBroker WebSocket: connect_error due to ${err.message}`);
          });

        this._socket.on('connect', function () {
            if (that._disconnectedSince) {
                var offlineTime = Date.now() - that._disconnectedSince;
                loggingController.createLog(undefined, LogLevel.WARN,`ioBroker WebSocket: was offline for ${(offlineTime / 1000)} s.`);

                // reload whole page if no connection longer than some period
                if (that._reloadInterval && offlineTime > that._reloadInterval * 1000 && !this.authError) {
                    // TODO: that.reload();
                }

                that._disconnectedSince = null;
            }

            if (that._connectInterval) {
                clearInterval(that._connectInterval);
                that._connectInterval = null;
            }
            if (that._countInterval) {
                clearInterval(that._countInterval);
                that._countInterval = null;
            }

            that._socket.emit('name', connOptions.name);
            loggingController.createLog(undefined, LogLevel.INFO,`ioBroker WebSocket: Connected => authenticate.`);

            setTimeout(function () {
                const thatInner = this;

                var timeOut = 12000;
  
                this.waitConnect = setTimeout(function() {
                    console.error('No answer from server');
                    if (!this.authError) {
                        // TODO: that.reload();
                    }
                }, timeOut);

                that._socket.emit('authenticate', function (isOk, isSecure) {
                    if (thatInner.waitConnect) {
                        clearTimeout(thatInner.waitConnect);
                        thatInner.waitConnect = null;
                    }

                    loggingController.createLog(undefined, LogLevel.INFO,`ioBroker WebSocket: Authenticated: ${isOk}`);

                    if (isOk) {
                        that._onAuth(objectsRequired, isSecure);
                    } else {

                        loggingController.createLog(undefined, LogLevel.ERROR,`ioBroker WebSocket: permissionError`);
                    }
                });
            }, 50);
        });

        that._socket.on('reauthenticate', function (err) {
            if (that._connCallbacks.onConnChange) {
                that._connCallbacks.onConnChange(false);
            }
            console.warn('reauthenticate');
            if (this.waitConnect) {
                clearTimeout(this.waitConnect);
                this.waitConnect = null;
            }

            if (connCallbacks.onAuthError) {
                if (!this.authError) {
                    this.authError = true;
                    connCallbacks.onAuthError(err);
                }
            } else {
                this.reload();
            }
        });

        that._socket.on('connect_error', function () {

            that.reconnect(connOptions);
        });

        that._socket.on('disconnect', function () {
            that._disconnectedSince = Date.now();

            // called only once when connection lost (and it was here before)
            that._isConnected = false;
            if (that._connCallbacks.onConnChange) {
                setTimeout(function () {
                    //show server disconnect layer only when socket is not reconnected in the 5s timeout
                    if (that._isConnected) {
                        return
                    }
                    
                    that._connCallbacks.onConnChange(that._isConnected);
                }, 5000);
            } else {
                
            }

            // reconnect
            that.reconnect(connOptions);
        });

        // after reconnect the "connect" event will be called
        that._socket.on('reconnect', function () {
            var offlineTime = Date.now() - that._disconnectedSince;
            loggingController.createLog(undefined, LogLevel.WARN,`ioBroker WebSocket: was offline for ${(offlineTime / 1000)} s.`);

            // reload whole page if no connection longer than one minute
            if (that._reloadInterval && offlineTime > that._reloadInterval * 1000) {
                this.reload();
            }
            // anyway "on connect" is called
        });

        that._socket.on('objectChange', function (id, obj) {
            that._connCallbacks.onObjectChange && that._connCallbacks.onObjectChange(id, obj);
        });

        that._socket.on('stateChange', function (id, state) {
            if (!id || state === null || typeof state !== 'object') {
                return;
            }

            if (that._connCallbacks.onCommand && id === this.namespace + '.control.command') {
                if (state.ack) {
                    return;
                }

                if (state.val &&
                    typeof state.val === 'string' &&
                    state.val[0] === '{' &&
                    state.val[state.val.length - 1] === '}') {
                    try {
                        state.val = JSON.parse(state.val);
                    } catch (e) {
                        loggingController.createLog(undefined, LogLevel.WARN,`ioBroker WebSocket: ommand seems to be an object, but cannot parse it: ${state.val}`);
                    }
                }

                // if command is an object {instance: 'iii', command: 'cmd', data: 'ddd'}
                if (state.val && state.val.instance) {
                    if (that._connCallbacks.onCommand(state.val.instance, state.val.command, state.val.data)) {
                        // clear state
                        this.setState(id, {val: '', ack: true});
                    }
                } else if (that._connCallbacks.onCommand(that._cmdInstance, state.val, that._cmdData)) {
                    // clear state
                    this.setState(id, {val: '', ack: true});
                }
            } else if (id === this.namespace + '.control.data') {
                that._cmdData = state.val;
            } else if (id === this.namespace + '.control.instance') {
                that._cmdInstance = state.val;
            } else if (that._connCallbacks.onUpdate) {
                that._connCallbacks.onUpdate(id, state);
            }
        });

        that._socket.on('permissionError', function (err) {
            if (that._connCallbacks.onError) {
                /* {
                    command:
                    type:
                    operation:
                    arg:
                    }*/
                that._connCallbacks.onError(err);
            } else {
                loggingController.createLog(undefined, LogLevel.ERROR,`ioBroker WebSocket: permissionError`);
            }
        });

        that._socket.on('error', function (err) {
            if (err === 'Invalid password or user name') {
                console.warn('reauthenticate');
                if (this.waitConnect) {
                    clearTimeout(this.waitConnect);
                    this.waitConnect = null;
                }

                if (connCallbacks.onAuthError) {
                    if (!this.authError) {
                        this.authError = true;
                        connCallbacks.onAuthError(err);
                    }
                } else {
                    this.reload();
                }
            } else {
                console.error('Socket error: ' + err);

                that.reconnect(connOptions);
            }
        });
        
    }

    logout(callback) {
        if (!this._isConnected) {
            loggingController.createLog(undefined, LogLevel.WARN,`ioBroker WebSocket: No connection!`);
            return;
        }

        this._socket.emit('logout', callback);
    }

    getVersion(callback) {
        if (!this._checkConnection('getVersion', arguments)) {
            return;
        }

        this._socket.emit('getVersion', function (error, version) {
            callback && callback(version || error);
        });
    }

    subscribe(idOrArray, callback) {
        if (!this._checkConnection('subscribe', arguments)) {
            return;
        }

        this._socket.emit('subscribe', idOrArray, callback);
    }

    unsubscribe(idOrArray, callback) {
        if (!this._checkConnection('unsubscribe', arguments)) {
            return;
        }

        this._socket.emit('unsubscribe', idOrArray, callback);
    }

    _checkAuth(callback) {
        if (!this._isConnected) {
            loggingController.createLog(undefined, LogLevel.WARN,`ioBroker WebSocket: No connection!`);
            return;
        }
        //socket.io
        if (this._socket === null) {
            loggingController.createLog(undefined, LogLevel.ERROR,`ioBroker WebSocket: socket.io not initialized!`);
            return;
        }
        this._socket.emit('getVersion', function (error, version) {
            callback && callback(version || error);
        });
    }

    readFile(filename, callback, isRemote) {
        if (!callback) {
            throw 'No callback set';
        }


        if (!this._checkConnection('readFile', arguments)) {
            return;
        }

        var adapter = this.namespace;
        if (filename[0] === '/') {
            var p = filename.split('/');
            adapter = p[1];
            p.splice(0, 2);
            filename = p.join('/');
        }

        this._socket.emit('readFile', adapter, filename, function (err, data, mimeType) {
            setTimeout(function () {
                callback(err, data, filename, mimeType);
            }, 0);
        });
        
    }

    getMimeType(ext) {
        if (ext.indexOf('.') !== -1) {
            ext = ext.toLowerCase().match(/\.[^.]+$/);
        }
        var _mimeType;
        if (ext === '.css') {
            _mimeType = 'text/css';
        } else if (ext === '.bmp') {
            _mimeType = 'image/bmp';
        } else if (ext === '.png') {
            _mimeType = 'image/png';
        } else if (ext === '.jpg') {
            _mimeType = 'image/jpeg';
        } else if (ext === '.jpeg') {
            _mimeType = 'image/jpeg';
        } else if (ext === '.gif') {
            _mimeType = 'image/gif';
        } else if (ext === '.tif') {
            _mimeType = 'image/tiff';
        } else if (ext === '.js') {
            _mimeType = 'application/javascript';
        } else if (ext === '.html') {
            _mimeType = 'text/html';
        } else if (ext === '.htm') {
            _mimeType = 'text/html';
        } else if (ext === '.json') {
            _mimeType = 'application/json';
        } else if (ext === '.xml') {
            _mimeType = 'text/xml';
        } else if (ext === '.svg') {
            _mimeType = 'image/svg+xml';
        } else if (ext === '.eot') {
            _mimeType = 'application/vnd.ms-fontobject';
        } else if (ext === '.ttf') {
            _mimeType = 'application/font-sfnt';
        } else if (ext === '.woff') {
            _mimeType = 'application/font-woff';
        } else if (ext === '.wav') {
            _mimeType = 'audio/wav';
        } else if (ext === '.mp3') {
            _mimeType = 'audio/mpeg3';
        } else {
            _mimeType = 'text/javascript';
        }
        return _mimeType;
    }

    readFile64(filename, callback, isRemote) {
        
        if (!callback) {
            throw 'No callback set';
        }

        if (!this._checkConnection('readFile64', arguments)) {
            return;
        }

        
        var adapter = this.namespace;
        if (filename[0] === '/') {
            var p = filename.split('/');
            adapter = p[1];
            p.splice(0, 2);
            filename = p.join('/');
        }

        this._socket.emit('readFile64', adapter, filename, function (err, data, mimeType) {
            setTimeout(function () {
                if (data) {
                    callback(err, {mime: mimeType || this.getMimeType(filename), data: data}, filename);
                } else {
                    callback(err, {mime: mimeType || this.getMimeType(filename)}, filename);
                }
            }, 0);
        });
        
    }

    writeFile(filename, data, mode, callback) {
        if (typeof mode === 'function') {
            callback = mode;
            mode = null;
        }
        
        if (!this._checkConnection('writeFile', arguments)) {
            return;
        }

        if (typeof data === 'object') {
            data = JSON.stringify(data, null, 2);
        }

        var parts = filename.split('/');
        var adapter = parts[1];
        parts.splice(0, 2);
        if (adapter === 'vis') {
            this._socket.emit('writeFile', adapter, parts.join('/'), data, mode ? {mode: this._defaultMode} : {}, callback);
        } else {
            this._socket.emit('writeFile', this.namespace, filename, data, mode ? {mode: this._defaultMode} : {}, callback);
        }
        
    }

    // Write file base 64
    writeFile64(filename, data, callback) {
        if (!this._checkConnection('writeFile64', arguments)) {
            return;
        }

        var parts = filename.split('/');
        var adapter = parts[1];
        parts.splice(0, 2);

        this._socket.emit('writeFile64', adapter, parts.join('/'), data, {mode: this._defaultMode}, callback);
    }

    readDir(dirname, callback) {
        //socket.io
        if (this._socket === null) {
            loggingController.createLog(undefined, LogLevel.ERROR,`ioBroker WebSocket: socket.io not initialized!`);
            return;
        }
        dirname = dirname || '/';
        var parts = dirname.split('/');
        var adapter = parts[1];
        parts.splice(0, 2);

        this._socket.emit('readDir', adapter, parts.join('/'), {filter: true}, function (err, data) {
            callback && callback(err, data);
        });
    }

    mkdir(dirname, callback) {
        var parts = dirname.split('/');
        var adapter = parts[1];
        parts.splice(0, 2);

        this._socket.emit('mkdir', adapter, parts.join('/'), function (err) {
            callback && callback(err);
        });
    }

    unlink(name, callback) {
        var parts = name.split('/');
        var adapter = parts[1];
        parts.splice(0, 2);

        this._socket.emit('unlink', adapter, parts.join('/'), function (err) {
            callback && callback(err);
        });
    }

    renameFile(oldname, newname, callback) {
        var parts1 = oldname.split('/');
        var adapter = parts1[1];
        parts1.splice(0, 2);
        var parts2 = newname.split('/');
        parts2.splice(0, 2);
        this._socket.emit('rename', adapter, parts1.join('/'), parts2.join('/'), function (err) {
            callback && callback(err);
        });
    }

    setState(pointId, value, callback) {
        //socket.io
        if (this._socket === null) {
            //console.log('socket.io not initialized');
            return;
        }
        this._socket.emit('setState', pointId, value, callback);
    }

    sendTo(instance, command, payload, callback) {
        //socket.io
        if (this._socket === null) {
            //console.log('socket.io not initialized');
            return;
        }
        this._socket.emit('sendTo', instance, command, payload, callback);
    }

    // callback(err, data)
    getStates(IDs, callback) {
        if (typeof IDs === 'function') {
            callback = IDs;
            IDs = null;
        }


        if (!this._checkConnection('getStates', arguments)) {
            return;
        }
        
        this.gettingStates = this.gettingStates || 0;
        let that = this;
        if (this.gettingStates > 0) {
            // fix for slow devices -> if getStates still in progress, wait and try again
            //console.log('Trying to get states again, because emitted getStates still pending');
            setTimeout(function () {
                that.getStates(IDs, callback);
            }, 50);
            return;
        }

        this.gettingStates++;

        this._socket.emit('getStates', IDs, function (err, data) {
            that.gettingStates--;
            if (err || !data) {
                callback && callback(err || 'Authentication required');
            } else if (callback) {
                callback(null, data);
            }
        });
        
    }

    _fillChildren(objects) {
        var items = [];

        for (var id in objects) {
            if (!objects.hasOwnProperty(id)) {
                continue;
            }
            items.push(id);
        }
        items.sort();

        for (var i = 0; i < items.length; i++) {
            if (objects[items[i]].common) {
                var j = i + 1;
                var children = [];
                var len      = items[i].length + 1;
                var name     = items[i] + '.';
                while (j < items.length && items[j].substring(0, len) === name) {
                    children.push(items[j++]);
                }

                objects[items[i]].children = children;
            }
        }
    }

    getCharts(data, callback) {
        
        // Check if chart view exists
        this._socket.emit('getObject', '_design/chart', function (err, obj) {
            if (obj && obj.views && obj.views.chart) {
                // Read all charts
                this._socket.emit('getObjectView', 'chart', 'chart', {startkey: '', endkey: '\u9999'}, function (err, res) {
                    if (err) {
                        callback(err);
                        return;
                    }
                    for (var i = 0; i < res.rows.length; i++) {
                        data[res.rows[i].value._id] = res.rows[i].value;
                    }
                    callback();
                });
            } else {
                callback();
            }
        });
    }

    // callback(err, data)
    getObjects(useCache, callback) {
        if (typeof useCache === 'function') {
            callback = useCache;
            useCache = false;
        }
        // If cache used
        if (this._useStorage && useCache) {
            if (this._objects) {
                return callback(null, this._objects);
            }
        }

        if (!this._checkConnection('getObjects', arguments)) {
            return;
        }
        
        this._socket.emit('getObjects', function (err, data) {
            // Read all enums
            this._socket.emit('getObjectView', 'system', 'enum', {startkey: 'enum.', endkey: 'enum.\u9999'}, function (err, res) {
                if (err) {
                    return callback(err);
                }
                var enums = {};
                for (var i = 0; i < res.rows.length; i++) {
                    data[res.rows[i].id] = res.rows[i].value;
                    enums[res.rows[i].id] = res.rows[i].value;
                }

                // Read all adapters for images
                this._socket.emit('getObjectView', 'system', 'instance', {startkey: 'system.adapter.', endkey: 'system.adapter.\u9999'}, function (err, res) {
                    if (err) {
                        return callback(err);
                    }
                    for (var i = 0; i < res.rows.length; i++) {
                        data[res.rows[i].id] = res.rows[i].value;
                    }
                    // find out default file mode
                    if (data['system.adapter.' + this.namespace] &&
                        data['system.adapter.' + this.namespace].native &&
                        data['system.adapter.' + this.namespace].native.defaultFileMode) {
                        this._defaultMode = data['system.adapter.' + this.namespace].native.defaultFileMode;
                    }

                    // Read all charts
                    this.getCharts(data, function () {
                        // Read all channels for images
                        this._socket.emit('getObjectView', 'system', 'channel', {startkey: '', endkey: '\u9999'}, function (err, res) {
                            if (err) {
                                callback(err);
                                return;
                            }
                            for (var i = 0; i < res.rows.length; i++) {
                                data[res.rows[i].id] = res.rows[i].value;
                            }
                            // Read all devices for images
                            this._socket.emit('getObjectView', 'system', 'device', {
                                startkey: '',
                                endkey: '\u9999'
                            }, function (err, res) {
                                if (err) {
                                    return callback(err);
                                }
                                for (var i = 0; i < res.rows.length; i++) {
                                    data[res.rows[i].id] = res.rows[i].value;
                                }

                                if (this._useStorage) {
                                    this._fillChildren(data);
                                    this._objects = data;
                                    this._enums = enums;
                                }

                                callback && callback(err, data);
                            });
                        });
                    });
                });
            });
        });
    }

    getChildren(id, useCache, callback) {
        if (!this._checkConnection('getChildren', arguments)) {
            return;
        }

        if (typeof id === 'function') {
            callback = id;
            id = null;
            useCache = false;
        }
        if (typeof id === 'boolean') {
            callback = useCache;
            useCache = id;
            id = null;
        }
        if (typeof useCache === 'function') {
            callback = useCache;
            useCache = false;
        }

        if (!id) {
            return callback('getChildren: no id given');
        }

        
        var data = [];

        if (this._useStorage && useCache) {
            if (this._objects && this._objects[id] && this._objects[id].children) {
                return callback(null, this._objects[id].children);
            }
        }

        // Read all devices
        this._socket.emit('getObjectView', 'system', 'device', {startkey: id + '.', endkey: id + '.\u9999'}, function (err, res) {
            if (err) {
                return callback(err);
            }
            for (var i = 0; i < res.rows.length; i++) {
                data[res.rows[i].id] = res.rows[i].value;
            }

            this._socket.emit('getObjectView', 'system', 'channel', {startkey: id + '.', endkey: id + '.\u9999'}, function (err, res) {
                if (err) {
                    return callback(err);
                }
                for (var i = 0; i < res.rows.length; i++) {
                    data[res.rows[i].id] = res.rows[i].value;
                }

                // Read all adapters for images
                this._socket.emit('getObjectView', 'system', 'state', {startkey: id + '.', endkey: id + '.\u9999'}, function (err, res) {
                    if (err) {
                        return callback(err);
                    }
                    for (var i = 0; i < res.rows.length; i++) {
                        data[res.rows[i].id] = res.rows[i].value;
                    }
                    var list = [];

                    var count = id.split('.').length;

                    // find direct children
                    for (var _id in data) {
                        if (data.hasOwnProperty(_id)) {
                            var parts = _id.split('.');
                            if (count + 1 === parts.length) {
                                list.push(_id);
                            }
                        }
                    }
                    list.sort();

                    /*if (this._useStorage && typeof storage !== 'undefined') {
                        var objects = storage.get('objects') || {};

                        for (var id_ in data) {
                            if (data.hasOwnProperty(id_)) {
                                objects[id_] = data[id_];
                            }
                        }
                        if (objects[id] && objects[id].common) {
                            objects[id].children = list;
                        }
                        // Store for every element theirs children
                        var items = [];
                        for (var __id in data) {
                            if (data.hasOwnProperty(__id)) {
                                items.push(__id);
                            }
                        }
                        items.sort();

                        for (var k = 0; k < items.length; k++) {
                            if (objects[items[k]].common) {
                                var j = k + 1;
                                var children = [];
                                var len  = items[k].length + 1;
                                var name = items[k] + '.';
                                while (j < items.length && items[j].substring(0, len) === name) {
                                    children.push(items[j++]);
                                }

                                objects[items[k]].children = children;
                            }
                        }

                        storage.set('objects', objects);
                    }*/

                    callback && callback(err, list);
                });
            });
        });
    }

    getObject(id, useCache, callback) {
        if (typeof id === 'function') {
            callback = id;
            id = null;
            useCache = false;
        }
        if (typeof id === 'boolean') {
            callback = useCache;
            useCache = id;
            id = null;
        }
        if (typeof useCache === 'function') {
            callback = useCache;
            useCache = false;
        }
        if (!id)
            return callback('no id given');

        // If cache used
        if (this._useStorage && useCache) {
            if (this._enums) {
                return callback(null, this._enums);
            }
        }

        

        this._socket.emit('getObject', id, function (err, obj) {
            if (err) {
                callback(err);
                return;
            }
            return callback(null, obj);
        });
    }

    getGroups(groupName, useCache, callback) {
        if (typeof groupName === 'function') {
            callback = groupName;
            groupName = null;
            useCache = false;
        }
        if (typeof groupName === 'boolean') {
            callback = useCache;
            useCache = groupName;
            groupName = null;
        }
        if (typeof useCache === 'function') {
            callback = useCache;
            useCache = false;
        }
        groupName = groupName || '';

        // If cache used
        if (this._useStorage && useCache) {
            if (this._groups) {
                return callback(null, this._groups);
            }
        }
        if (this._type === 'local') {
            return callback(null, []);
        } else {
            
            // Read all enums
            this._socket.emit('getObjectView', 'system', 'group', {startkey: 'system.group.' + groupName, endkey: 'system.group.' + groupName + '\u9999'}, function (err, res) {
                if (err) {
                    return callback(err);
                }
                var groups = {};
                for (var i = 0; i < res.rows.length; i++) {
                    var obj = res.rows[i].value;
                    groups[obj._id] = obj;
                }
                if (this._useStorage) {
                    this._groups  = groups;
                }

                callback(null, groups);
            });
        }
    }

    getEnums(enumName, useCache, callback) {
        if (typeof enumName === 'function') {
            callback = enumName;
            enumName = null;
            useCache = false;
        }
        if (typeof enumName === 'boolean') {
            callback = useCache;
            useCache = enumName;
            enumName = null;
        }
        if (typeof useCache === 'function') {
            callback = useCache;
            useCache = false;
        }

        // If cache used
        if (this._useStorage && useCache) {
            if (this._enums) {
                return callback(null, this._enums);
            }
        }

        if (this._type === 'local') {
            return callback(null, []);
        } else {

            enumName = enumName ? enumName + '.' : '';
            
            // Read all enums
            this._socket.emit('getObjectView', 'system', 'enum', {startkey: 'enum.' + enumName, endkey: 'enum.' + enumName + '\u9999'}, function (err, res) {
                if (err) {
                    return callback(err);
                }
                var enums = {};
                for (var i = 0; i < res.rows.length; i++) {
                    var obj = res.rows[i].value;
                    enums[obj._id] = obj;
                }
                callback(null, enums);
            });
        }
    }

    getLoggedUser(callback) {
        this._socket.emit('authEnabled', callback);
    }

    // return time when the objects were synchronized
    getSyncTime() {
        /*if (this._useStorage && typeof storage !== 'undefined') {
            var timeSync = storage.get('timeSync');
            if (timeSync) {
                return new Date(timeSync);
            }
        }*/
        return null;
    }

    addObject(objId, obj, callback) {
        if (!this._isConnected) {
            loggingController.createLog(undefined, LogLevel.WARN,`ioBroker WebSocket: No connection!`);
        } else
        //socket.io
        if (this._socket === null) {
            loggingController.createLog(undefined, LogLevel.ERROR,`ioBroker WebSocket: socket.io not initialized!`);
        }
    }

    delObject(objId) {
        if (!this._checkConnection('delObject', arguments)) {
            return;
        }

        this._socket.emit('delObject', objId);
    }

    httpGet(url, callback) {
        if (!this._isConnected) {
            loggingController.createLog(undefined, LogLevel.WARN,`ioBroker WebSocket: No connection!`);
            return;
        }
        //socket.io
        if (this._socket === null) {
            loggingController.createLog(undefined, LogLevel.ERROR,`ioBroker WebSocket: socket.io not initialized!`);
            return;
        }
        this._socket.emit('httpGet', url, function (data) {
            callback && callback(data);
        });
    }

    logError(errorText) {
        loggingController.createLog(undefined, LogLevel.ERROR,`ioBroker WebSocket: Error: ${errorText}`);
        if (!this._isConnected) {
            //console.log('No connection!');
            return;
        }
        //socket.io
        if (this._socket === null) {
            loggingController.createLog(undefined, LogLevel.ERROR,`ioBroker WebSocket: socket.io not initialized!`);
            return;
        }
        this._socket.emit('log', 'error', 'Addon DashUI  ' + errorText);
    }

    _queueCmdIfRequired(func, args) {
        
        if (!this._isAuthDone) {
            // Queue command
            this._cmdQueue.push({func: func, args: args});

            if (!this._authRunning) {
                this._authRunning = true;
                let that = this;
                // Try to read version
                this._checkAuth(function (version) {
                    // If we have got version string, so there is no authentication, or we are authenticated
                    that._authRunning = false;
                    if (version) {
                        that._isAuthDone  = true;
                        // Repeat all stored requests
                        var __cmdQueue = that._cmdQueue;
                        // Trigger GC
                        that._cmdQueue = null;
                        that._cmdQueue = [];
                        for (var t = 0, len = __cmdQueue.length; t < len; t++) {
                            that[__cmdQueue[t].func].apply(that, __cmdQueue[t].args);
                        }
                    } else {
                        // Auth required
                        that._isAuthRequired = true;
                        // What for AuthRequest from server
                    }
                });
            }

            return true;
        } else {
            return false;
        }
    }

    authenticate(user, password, salt) {
        this._authRunning = true;

        if (user !== undefined) {
            this._authInfo = {
                user: user,
                hash: password + salt,
                salt: salt
            };
        }

        if (!this._isConnected) {
            loggingController.createLog(undefined, LogLevel.WARN,`ioBroker WebSocket: No connection!`);
            return;
        }

        if (!this._authInfo) {
            loggingController.createLog(undefined, LogLevel.WARN,`ioBroker WebSocket: No credentials!`);
            return;
        }
    }

    getConfig(useCache, callback) {
        if (!this._checkConnection('getConfig', arguments)) {
            return;
        }

        if (typeof useCache === 'function') {
            callback = useCache;
            useCache = false;
        }
        if (this._useStorage && useCache) {
            if (this._objects && this._objects['system.config']) {
                return callback(null, this._objects['system.config'].common);
            }
        }
        
        this._socket.emit('getObject', 'system.config', function (err, obj) {
            if (callback && obj && obj.common) {
                callback(null, obj.common);
            } else {
                callback('Cannot read language');
            }
        });
    }

    sendCommand(instance, command, data, ack) {
        this.setState(this.namespace + '.control.instance', {val: instance || 'notdefined', ack: true}, undefined);
        this.setState(this.namespace + '.control.data',     {val: data,    ack: true}, undefined);
        this.setState(this.namespace + '.control.command',  {val: command, ack: ack === undefined ? true : ack}, undefined);
    }

    _detectViews(projectDir, callback) {
        this.readDir('/' + this.namespace + '/' + projectDir, function (err, dirs) {
            // find vis-views.json
            for (var f = 0; f < dirs.length; f++) {
                if (dirs[f].file === 'vis-views.json' && (!dirs[f].acl || dirs[f].acl.read)) {
                    return callback(err, {name: projectDir, readOnly: (dirs[f].acl && !dirs[f].acl.write), mode: dirs[f].acl ? dirs[f].acl.permissions : 0});
                }
            }
            callback(err);
        });
    }

    readProjects(callback) {
        
        this.readDir('/' + this.namespace, function (err, dirs) {
            var result = [];
            var count = 0;
            for (var d = 0; d < dirs.length; d++) {
                if (dirs[d].isDir) {
                    count++;
                    this._detectViews(dirs[d].file, function (subErr, project) {
                        project && result.push(project);
                        err = err || subErr;
                        !--count && callback(err, result);
                    });
                }
            }
        });
    }

    chmodProject(projectDir, mode, callback) {
        //socket.io
        if (this._socket === null) {
            loggingController.createLog(undefined, LogLevel.ERROR,`ioBroker WebSocket: socket.io not initialized!`);
            return;
        }
        this._socket.emit('chmodFile', this.namespace, projectDir + '*', {mode: mode}, function (err, data) {
            callback && callback(err, data);
        });
    }

    clearCache() {
        /*if (typeof storage !== 'undefined') {
            storage.empty();
        }*/
    }

    getHistory(id, options, callback) {
        if (!this._checkConnection('getHistory', arguments)) {
            return;
        }

        options = options || {};
        options.timeout = options.timeout || 2000;

        var timeout = setTimeout(function () {
            timeout = null;
            callback('timeout');
        }, options.timeout);

        this._socket.emit('getHistory', id, options, function (err, result) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            callback(err, result);
        });
    }

    getLiveHost(cb) {
        this._socket.emit('getObjectView', 'system', 'host', {startkey: 'system.host.', endkey: 'system.host.\u9999'}, function (err, res) {
            var _hosts = [];
            for (var h = 0; h < res.rows.length; h++) {
                _hosts.push(res.rows[h].id + '.alive');
            }
            if (!_hosts.length) {
                return cb('');
            }
            this.getStates(_hosts, function (err, states) {
                for (var h in states) {
                    if (states.hasOwnProperty(h) && (states[h].val === 'true' || states[h].val === true)) {
                        return cb(h.substring(0, h.length - '.alive'.length));
                    }
                }

                cb('');
            });
        });
    }

    readDirAsZip(project, useConvert, callback) {
        if (!callback) {
            callback = useConvert;
            useConvert = undefined;
        }
        if (!this._isConnected) {
            loggingController.createLog(undefined, LogLevel.WARN,`ioBroker WebSocket: No connection!`);
            return;
        }
        //socket.io
        if (this._socket === null) {
            loggingController.createLog(undefined, LogLevel.ERROR,`ioBroker WebSocket: socket.io not initialized!`);
            return;
        }
        if (project.match(/\/$/)) {
            project = project.substring(0, project.length - 1);
        }

        
        this.getLiveHost(function (host) {
            if (!host) {
                loggingController.createLog(undefined, LogLevel.WARN,`ioBroker WebSocket: No active host found!`);
                return;
            }
            // to do find active host
            this._socket.emit('sendToHost', host, 'readDirAsZip', {
                id: this.namespace,
                name: project || 'main',
                options: {
                    settings: useConvert
                }
            }, function (data) {
                data.error && console.error(data.error);
                callback && callback(data.error, data.data);
            });

        });
    }

    writeDirAsZip(project, base64, callback) {
        if (!this._isConnected) {
            loggingController.createLog(undefined, LogLevel.WARN,`ioBroker WebSocket: No connection!`);
            return;
        }
        //socket.io
        if (this._socket === null) {
            return loggingController.createLog(undefined, LogLevel.ERROR,`ioBroker WebSocket: socket.io not initialized!`);
        }
        if (project.match(/\/$/)) {
            project = project.substring(0, project.length - 1);
        }
        
        this.getLiveHost(function (host) {
            if (!host) {
                loggingController.createLog(undefined, LogLevel.WARN,`ioBroker WebSocket: No active host found!`);
                return;
            }
            this._socket.emit('sendToHost', host, 'writeDirAsZip', {
                id:   this.namespace,
                name: project || 'main',
                data: base64
            }, function (data) {
                data.error && console.error(data.error);
                callback && callback(data.error);
            });

        });
    }
}