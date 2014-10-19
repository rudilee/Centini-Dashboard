app.handlers = {
    centini: {
        connected: function () {
            console.log('Centini Client connected..');
        },
        disconnected: function () {
            console.log('Centini Client disconnected..');
        },
        response: {
            login: function (headers) {
                if (headers.success) {
                    app.common.template.dashboard();
                } else {
                    app.centini.disconnect();
                    
                    $('#error-message').text(headers.message);
                    $('#error-dialog').modal();
                }
            },
            logout: function (headers) {
                app.common.template.loginForm();
            },
            status: function (headers) {
                ;
            },
            changePassword: function (headers) {
                ;
            }
        },
        event: {
            actionReady: function (headers) {
                app.centini.login($('#username').val(), $('#password').val());
            }
        }
    },
    loginForm: {
        loaded: function () {
            $('#login-form').submit(app.handlers.loginForm.submit);
        },
        submit: function (event) {
            app.centini.connectTo(app.settings.centini.host, app.settings.centini.port);

            event.preventDefault();
        }
    },
    dashboard: {
        loaded: function () {
            $('.badge').tooltip();
            $('#logout').click(app.handlers.dashboard.logout);
        },
        logout: function () {
            app.centini.logout();
        }
    }
};