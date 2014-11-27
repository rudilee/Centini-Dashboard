/*global WebSocket*/
/*global console*/

function CentiniClient() {
    "use strict";
    
    this.callbacks = {
        response: {},
        event: {}
    };
}

CentiniClient.prototype.connectTo = function (host, port) {
    "use strict";
    
    var self = this;
    
    this.socket = new WebSocket('ws://' + host + ':' + port);
    this.socket.onopen = function (event) { self.onOpened(event); };
    this.socket.onerror = function (event) { self.onError(event); };
    this.socket.onclose = function (event) { self.onClosed(event); };
    this.socket.onmessage = function (event) { self.onMessage(event); };
};

CentiniClient.prototype.disconnect = function () {
    "use strict";
    
    if (this.socket.readyState === this.socket.OPEN) {
        this.socket.close();
    }
};

CentiniClient.prototype.connected = function () {
    "use strict";
    
    return this.socket.readyState === this.socket.OPEN;
};

CentiniClient.prototype.onOpened = function (event) {
    "use strict";
    
    if (this.callbacks.hasOwnProperty('connected')) {
        this.callbacks.connected(this);
    }
    
    console.log('Socket opened..');
};

CentiniClient.prototype.onClosed = function (event) {
    "use strict";
    
    if (this.callbacks.hasOwnProperty('disconnected')) {
        this.callbacks.disconnected(this);
    }
    
    console.log('Socket closed..');
};

CentiniClient.prototype.onError = function (event) {
    "use strict";
    
    console.log('Socket error..');
};

CentiniClient.prototype.onMessage = function (event) {
    "use strict";
    
    console.log('Headers: ' + event.data);
    
    var headers = JSON.parse(event.data),
        isRequest = typeof headers.request !== 'undefined',
        callbackKey = isRequest ? headers.request : headers.response;
    
    if (headers.type === 'Event') {
        if (this.callbacks.event.hasOwnProperty(headers.event)) {
            this.callbacks.event[headers.event](headers);
        }
    } else if (headers.type === 'Response') {
        if (this.callbacks.response.hasOwnProperty(callbackKey)) {
            this.callbacks.response[callbackKey](headers);
        }
    }
};

CentiniClient.prototype.on = function (event, callback) {
    "use strict";
    
    this.callbacks[event] = callback;
};

CentiniClient.prototype.onResponse = function (response, callback) {
    "use strict";
    
    this.callbacks.response[response] = callback;
};

CentiniClient.prototype.onEvent = function (event, callback) {
    "use strict";
    
    this.callbacks.event[event] = callback;
};

CentiniClient.prototype.sendMessage = function (headers) {
    "use strict";
    
    if (this.socket.readyState === this.socket.OPEN) {
        this.socket.send(JSON.stringify(headers));
    }
};

CentiniClient.prototype.sendAction = function (action, headers) {
    "use strict";
    
    if (typeof headers === 'undefined') {
        headers = {};
    }
    
    headers.action = action;
    
    this.sendMessage(headers);
};

CentiniClient.prototype.sendRequest = function (request, headers) {
    "use strict";
    
    if (typeof headers === 'undefined') {
        headers = {};
    }
    
    headers.request = request;
    
    this.sendMessage(headers);
};

CentiniClient.prototype.login = function (username, password) {
    "use strict";
    
    var headers = {
        username: username,
        password: password
    };
    
    this.sendAction('Login', headers);
};

CentiniClient.prototype.logout = function () {
    "use strict";
    
    this.sendAction('Logout');
};

CentiniClient.prototype.dial = function (number, username) {
    "use strict";
    
    var headers = {};
    
    if (number === null) {
        headers.username = username;
    } else {
        headers.number = number;
    }
    
    this.sendAction('Dial', headers);
};

CentiniClient.prototype.hold = function (onHold) {
    "use strict";
    
    var headers = {
        hold: onHold
    };
    
    this.sendAction('Hold', headers);
};

CentiniClient.prototype.hangup = function (username) {
    "use strict";
    
    var headers = {};
    
    if (typeof username === 'undefined') {
        headers.username = username;
    }
    
    this.sendAction('Hangup', headers);
};

CentiniClient.prototype.transfer = function (destination) {
    "use strict";
    
    var headers = {
        destination: destination
    };
    
    this.sendAction('Transfer', headers);
};

CentiniClient.prototype.sendDigit = function (digit) {
    "use strict";
    
    var headers = {
        digit: digit
    };
    
    this.sendAction('SendDigit', headers);
};

CentiniClient.prototype.listen = function (username, action) {
    "use strict";
    
    var headers = {
        username: username
    };
    
    if (typeof action === 'undefined') {
        action = 'Listen';
    }
    
    this.sendAction(action, headers);
};

CentiniClient.prototype.whisper = function (username) {
    "use strict";
    
    this.listen(username, 'Whisper');
};

CentiniClient.prototype.barge = function (username) {
    "use strict";
    
    this.listen(username, 'Barge');
};

CentiniClient.prototype.pause = function (paused, reason) {
    "use strict";
    
    var headers = {
        paused: paused,
        reason: reason
    };
    
    if (typeof reason === 'undefined') {
        headers.reason = reason;
    }
    
    this.sendAction('Pause', headers);
};

CentiniClient.prototype.status = function () {
    "use strict";
    
    this.sendRequest('Status');
};

CentiniClient.prototype.changePassword = function (username, password, newPassword) {
    "use strict";
    
    var headers = {
        new_password: newPassword
    };
    
    if (username !== null) {
        headers.username = username;
    }
    
    if (password !== null) {
        headers.password = password;
    }
    
    this.sendRequest('ChangePassword', headers);
};
