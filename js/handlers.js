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
                    app.common.template('#content-wrap', 'dashboard.html', app.handlers.dashboard.loaded)();
                } else {
                    app.centini.disconnect();
                    app.common.error(headers.message, 'Login gagal');
                }
            },
            logout: function (headers) {
                app.common.template('#content-wrap', 'login.html', app.handlers.loginForm.loaded)();
            },
            status: function (headers) {
                $('#user-fullname').text(headers.fullname);
                
                if (headers.level === 'Administrator') {
                    app.common.template('#content-body', 'administration.html', app.handlers.administration.loaded)();
                } else if (['Agent', 'Supervisor', 'Manager'].indexOf(headers.level) > -1) {
                    app.common.template('#content-body', 'client.html', app.handlers.client.loaded)();
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
            
            $('#external-url').addClass('hidden').attr('src', '');
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
            $('#manage-users').click(app.common.template('#content-panel', 'managements/manage_users.html', app.handlers.administration.manageUsers.loaded));
            $('#queue-statistics').click(app.common.template('#content-panel', 'reports/queue_statistics.html', app.handlers.administration.queueStatistics.loaded));
        },
        manageUsers: {
            loaded: function (responseText, textStatus, jqXHR) {
                $('.edit-user').click(app.handlers.administration.manageUsers.editUser);
            },
            editUser: function () {
                $('#user-dialog').modal();
            }
        },
        queueStatistics: {
            loaded: function (responseText, textStatus, jqXHR) {
                ;
            }
        }
    },
    client: {
        loaded: function (responseText, textStatus, jqXHR) {
            $('#centini-client-button').click(app.handlers.client.centiniClient.show);
            $('#centini-client .close').click(app.handlers.client.centiniClient.hide);
            
            $('#external-url').removeClass('hidden').attr('src', 'https://demos2.softaculous.com/SugarCRM/index.php');
        },
        centiniClient: {
            show: function (event) {
                $('#centini-client').show();
                $('#centini-client-button').addClass('hidden');
            },
            hide: function (event) {
                $('#centini-client').hide();
                $('#centini-client-button').removeClass('hidden');
            }
        }
    }
};