const INTEGRATIONS = {
    'MMM-AssistantMk2': function() {
        this.sendSocketNotification('PAUSE');
        this.sendNotification('ASSISTANT_ACTIVATE', {profile: 'default', type: 'MIC'});
    }
};

Module.register('MMM-Bumblebee', {
    defaults: {
        sensitivity: 0.8,
        hotwords: {}
    },

    start: function() {
        this.sendSocketNotification('INIT', this.config);
    },

    getDom: function() {
        return document.createTextNode('');
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
                this._doAction(payload);
                break;
        }
    },

    _doAction: function(hotword) {
        if (!this.config.hotwords.hasOwnProperty(hotword)) {
            // Impossible case
            return;
        }

        const data = this.config.hotwords[hotword];
        if (data.integration && INTEGRATIONS.hasOwnProperty(data.integration)) {
            INTEGRATIONS[data.integration].call(this, hotword);
        } else if (data.action) {
            data.action.call(this, hotword);
        }
    }
});
