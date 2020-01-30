const INTEGRATIONS = {
    'MMM-AssistantMk2': function() {
        this.sendSocketNotification('PAUSE');
        this.sendNotification('ASSISTANT_ACTIVATE', {profile: 'default', type: 'MIC'});
    },
    'alert': function(hotword) {
        this.sendNotification('SHOW_ALERT', {type: 'notification', title: 'Hotword detected', message: this.config.hotwords[hotword].word, timer: this.config.delay});
    }
};

Module.register('MMM-Bumblebee', {
    defaults: {
        sensitivity: 0.8, // 0..1
        hotwords: {},
        ui: true, // true, false, 'icon'
        colors: {
            standby: '#aaa',
            error: '#ff3737',
            detected: '#5dc1ff'
        },
        delay: 3000
    },

    start: function() {
        this.sendSocketNotification('INIT', this.config);
    },

    getDom: function() {
        if (!this.config.ui) {
            return document.createTextNode('');
        }

        this.container = document.createElement('div');
        this.container.id = 'MMMBB';
        this.container.innerHTML = '<svg version="1.1" viewBox="11 11 60 60" fill="currentColor" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g><path d="M40,49c4.971,0,9-4.029,9-9V24c0-4.971-4.029-9-9-9s-9,4.029-9,9v16C31,44.971,35.029,49,40,49z M36,24   c0-2.206,1.794-4,4-4s4,1.794,4,4v16c0,2.206-1.794,4-4,4s-4-1.794-4-4V24z"/><path d="M59,40h-5c0,7.72-6.28,14-14,14s-14-6.28-14-14h-5c0,9.627,7.204,17.586,16.5,18.816V62H29v5h22v-5h-8.5v-3.184   C51.796,57.586,59,49.627,59,40z"/></g></svg>';


        if (this.config.ui !== 'icon') {
            this.text = document.createElement('div');
            this.container.appendChild(this.text);
        }

        return this.container;
    },

    getStyles: function () {
        return [this.file(`${this.name}.css`)];
    },

    notificationReceived: function(notification, payload, sender) {
        switch (notification) {
            case 'ASSISTANT_STANDBY':
                this.sendSocketNotification('RESUME');
                break;

            case 'BUMBLEBEE_PAUSE':
                this.sendSocketNotification('PAUSE');
                break;

            case 'BUMBLEBEE_RESUME':
                this.sendSocketNotification('RESUME');
                break
        }
    },

    socketNotificationReceived: function(notification, payload) {
        switch (notification) {
            case 'HOTWORD_DETECTED':
                this._render('detected', payload);
                this._doAction(payload);
                break;

            case 'FATAL_ERROR':
                this._render('error');
                break;

            case 'READY':
                this.config.hotwords = payload;

                const words = Object.values(payload).map(data => data.word);
                const last = words.pop();
                this.standbyText = `Say "${words.join('", "')}" or "${last}"`;

                this._render('standby');
                break;
        }
    },

    _render: function(state, hotword) {
        if (!this.container) {
            return;
        }

        // Set classes and colors
        this.container.classList.remove('__detected', '__error', '__standby');
        this.container.classList.add(`__${state}`);
        this.container.style.color = this.config.colors[state];

        // Start timeout for 'detected' state
        if (state === 'detected') {
            setTimeout(() => {
                this._render('standby');
            }, this.config.delay);
        }

        if (!this.text) {
            return;
        }

        // Set text
        switch (state) {
            case 'detected':
                this.text.textContent = this.config.hotwords[hotword].word;
                break;

            case 'error':
                this.text.textContent = 'Initialization error';
                break;

            case 'standby':
                this.text.textContent = this.standbyText;
                break;
        }
    },

    _doAction: function(hotword) {
        if (!this.config.hotwords.hasOwnProperty(hotword)) {
            // Impossible case
            return;
        }

        const data = this.config.hotwords[hotword];

        for (const integration of (data.integrations || [])) {
            if (INTEGRATIONS.hasOwnProperty(integration)) {
                INTEGRATIONS[integration].call(this, hotword);
            }
        }

        if (data.action) {
            data.action.call(this, hotword);
        }
    }
});
