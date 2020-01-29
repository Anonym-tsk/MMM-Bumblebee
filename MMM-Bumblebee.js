// TODO: detect rec is installed

const INTEGRATION = {
    ASSISTANT: 'MMM-AssistantMk2'
};
const INTEGRATION_ACTION = {};
INTEGRATION_ACTION[INTEGRATION.ASSISTANT] = function() {
    this.sendSocketNotification('PAUSE');
    this.sendNotification('ASSISTANT_ACTIVATE', {profile: 'default', type: 'MIC'});
};

Module.register('MMM-Bumblebee', {
    defaults: {
        sensitivity: 0.8,
        hotwords: [
            {
                hotword: 'bumblebee',
                sensitivity: 0.7,
                integration: INTEGRATION.ASSISTANT
            },
            {
                hotword: 'magenta',
                sensitivity: 0.7,
                action: () => {
                    Log.log('Magenta!');
                }
            }
        ]
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
        for (const data of this.config.hotwords) {
            if (data.hotword === hotword) {
                if (data.integration && INTEGRATION_ACTION.hasOwnProperty(data.integration)) {
                    INTEGRATION_ACTION[data.integration].call(this);
                } else if (data.action) {
                    data.action.call(this);
                }
                break;
            }
        }
    }
});
