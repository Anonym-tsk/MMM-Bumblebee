'use strict';

const NodeHelper = require('node_helper');
const BumbleBee = require('bumblebee-hotword-node');

module.exports = NodeHelper.create({
    _isReady: false,
    _isStarted: false,

    bumblebee: null,

    _log: function(...args) {
        console.log(`[${this.name}]`, ...args);
    },

    start: function() {
        this.bumblebee = new BumbleBee({hotwords: []});
        this.bumblebee.setSensitivity(0.8);

        this.bumblebee.on('hotword', (hotword) => {
            this._log('Hotword Detected', hotword);
            this.sendSocketNotification('HOTWORD_DETECTED', hotword)
        });

        this.bumblebee.on('end', () => {
            this._log('Ended');
        });

        this._isReady = true;
        this._log('Ready');
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
        for (const hotword of config.hotwords) {
            const data = require(`./hotwords/${hotword.hotword}`);
            this.bumblebee.addHotword(hotword.hotword, data, hotword.sensitivity);
        }
        this.config = config;
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
