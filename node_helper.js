'use strict';

const findExec = require('find-exec');
const NodeHelper = require('node_helper');
const BumbleBee = require('bumblebee-hotword-node');

module.exports = NodeHelper.create({
    _isReady: false,
    _isStarted: false,

    bumblebee: null,

    _log: function(...args) {
        console.log(`[${this.name}]`, ...args);
    },

    _warn: function(...args) {
        console.warn(`[${this.name}]`, ...args);
    },

    _error: function(...args) {
        console.error(`[${this.name}]`, ...args);
    },

    start: function() {
        if (!findExec('rec')) {
            this._error(`Not started: 'rec' is not installed`);
            this.sendSocketNotification('FATAL_ERROR');
            return;
        }

        this.bumblebee = new BumbleBee({hotwords: []});
        this.bumblebee.setSensitivity(0.8);

        this.bumblebee.on('hotword', (hotword) => {
            this._log(`Hotword detected: '${hotword}'`);
            this.sendSocketNotification('HOTWORD_DETECTED', hotword);
        });

        this.bumblebee.on('end', () => {
            this._log('Ended');
        });
    },

    stop: function() {
        this._stop();
        this._isReady = false;
    },

    _start: function() {
        if (this._isReady && !this._isStarted) {
            this._isStarted = true;
            this.bumblebee.start();
            this._log('Started');
        }
    },

    _stop: function() {
        if (this._isReady && this._isStarted) {
            this.bumblebee.stop();
            this._isStarted = false;
            this._log('Stopped');
        }
    },

    _init: function(config) {
        if (!this.bumblebee) {
            return;
        }

        // Load hotwords
        for (const [hotword, opts] of Object.entries(config.hotwords)) {
            try {
                const data = require(`./hotwords/${hotword}`);
                this.bumblebee.addHotword(hotword, data, opts.sensitivity || config.sensitivity);

                const word = hotword.replace(/[^a-zA-Z]+/g, ' ');
                opts.word = word.charAt(0).toUpperCase() + word.slice(1);
            } catch (e) {
                this._warn(`Hotword '${hotword}' not found`);
                delete config.hotwords[hotword];
            }
        }

        // Check hotwords loaded
        if (!Object.keys(config.hotwords).length) {
            this._isReady = false;
            this._error('Not started: hotwords are not configured');
            this.sendSocketNotification('FATAL_ERROR');
            return;
        }

        this._isReady = true;
        this._log('Ready');
        this.sendSocketNotification('READY', config.hotwords);

        this._start();
    },

    socketNotificationReceived: function(notification, payload) {
        switch (notification) {
            case 'INIT':
                this._init(payload);
                break;
            case 'PAUSE':
                this._stop();
                break;
            case 'RESUME':
                this._start();
                break;
        }
    }
});
