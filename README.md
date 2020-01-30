## MMM-Bumblebee

![screenshot](https://raw.githubusercontent.com/jaxcore/bumblebee-hotword/master/logo.png)

MMM-Bumblebee is a hotword detector using [BumbleBee](https://github.com/jaxcore/bumblebee-hotword-node). You can use this module to wake another voice assistant or to give a command to other module.

### Installation

```
cd ~/MagicMirror/modules
git clone https://github.com/Anonym-tsk/MMM-Bumblebee.git
cd MMM-Bumblebee

npm install
```

### Configuration

##### Minimal
```
{
  module: 'MMM-Bumblebee',
  position: 'top_left',
  config: {
    hotwords: {
      bumblebee: {
        integrations: ['MMM-AssistantMk2']
      },
      hey_edison: {
        action: function(hotword) {
          this.sendNotification('CUSTOM_NOTIFICATION', hotword);
        }
      }
    }
  }
},
```

##### Detailed
```
{
  module: 'MMM-Bumblebee',
  position: 'top_left',
  config: {
    sensitivity: 0.8,
    hotwords: {
      bumblebee: {
        integrations: ['MMM-AssistantMk2', 'alert']
      },
      hey_edison: {
        sensitivity: 0.9,
        integrations: ['alert']
        action: function(hotword) {
          this.sendNotification('CUSTOM_NOTIFICATION', hotword);
        }
      }
    }
    ui: true,
    colors: {
      standby: '#aaa',
      error: '#ff3737',
      detected: '#5dc1ff'
    },
    delay: 3000
  }
},
```

Property | Default value | Description
--- | --- | ---
`hotwords` | Not set, **required** | See [hotwords](#hotwords)
`sensitivity` | `0.8` | Hotword detection sensitivity (`0.0` to `1.0`)
`ui` | `true` | Set to `false` to disable UI, `'icon'` for simple UI with icon only
`colors` | `{standby: '#aaa', error: '#ff3737', detected: '#5dc1ff'}` | UI colors ![#aaa](https://placehold.it/15/aaa/000000?text=+)![#ff3737](https://placehold.it/15/ff3737/000000?text=+)![#5dc1ff](https://placehold.it/15/5dc1ff/000000?text=+)
`delay` | `3000` | Delay in `detected` state

##### Hotwords
Property | Description
--- | ---
`sensitivity` | Hotword detection sensitivity (`0.0` to `1.0`)
`integration` | Integration with other modules. Currently only `MMM-AssistantMk2` and `alert` are supported
`action` | Function to call when hotword is detected

##### Builtin hotwords that you can use
* `bumblebee`
* `grasshopper`
* `hey_edison`
* `porcupine`
* `magenta`
* `computer`
* `hey_google`
* `smart_mirror`

The [Picovoice hotwords open source hotwords](https://github.com/Picovoice/Porcupine/tree/master/resources/keyword_files) are freely usable under the Apache 2.0 license.

You can make personal hotword using [Picovoice Console](https://console.picovoice.ai/).