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
                    
                    $('#login-failed .modal-body').text(headers.message);
                    $('#login-failed').modal();
                }
            },
            logout: function (headers) {
                app.common.template.loginForm();
            },
            status: function (headers) {
                if (headers.level === 'Administrator') {
                   app.common.template.administration.base();
                }
            },
            changePassword: function (headers) {
                app.handlers.dashboard.changePassword.alert(headers.success, headers.message);
                
                if (headers.success) {
                    $('#change-password-dialog').modal('hide');
                }
            }
        },
        event: {
            actionReady: function (headers) {
                app.centini.login($('#username').val(), $('#password').val());
            }
        }
    },
    loginForm: {
        loaded: function (responseText, textStatus, jqXHR) {
            $('#content-wrap').removeClass('container-fluid').addClass('container');
            
            $('#login-form').submit(app.handlers.loginForm.submit);
        },
        submit: function (event) {
            app.centini.connectTo(app.settings.centini.host, app.settings.centini.port);

            event.preventDefault();
        }
    },
    dashboard: {
        loaded: function (responseText, textStatus, jqXHR) {
            $('#content-wrap').removeClass('container').addClass('container-fluid');
            
            $('#change-password').click(app.handlers.dashboard.changePassword.show);
            $('#change-password-form').submit(app.handlers.dashboard.changePassword.submit);
            $('#change-password-dialog').on('hidden.bs.modal', app.handlers.dashboard.changePassword.hidden);
            
            $('#logout').click(app.handlers.dashboard.logout);
            
            app.centini.status();
        },
        changePassword: {
            show: function () {
                $('#change-password-dialog').modal();
            },
            submit: function (event) {
                var password = $('#password').val(),
                    newPassword = $('#new-password').val(),
                    newPasswordConfirm = $('#new-password-confirm').val();

                if (newPassword === newPasswordConfirm) {
                    app.centini.changePassword(null, password, newPassword);
                } else {
                    app.handlers.dashboard.changePassword.alert(false, 'Password baru dan konfirmasi tidak sama');
                }
                
                event.preventDefault();
            },
            hidden: function () {
                $('#change-password-dialog .alert').addClass('hidden');
                $('#password').val('');
                $('#new-password').val('');
                $('#new-password-confirm').val('');
            },
            alert: function (success, message) {
                $('#change-password-dialog .alert').addClass(success ? 'alert-success' : 'alert-danger').text(message).removeClass('hidden');
            }
        },
        logout: function () {
            app.centini.logout();
        }
    },
    administration: {
        loaded: function (responseText, textStatus, jqXHR) {
            $('#queue-statistics').click(app.common.template.administration.queueStatistics);
        },
        queueStatistics: {
            loaded: function (responseText, textStatus, jqXHR) {
                ;
            }
        }
    }
};