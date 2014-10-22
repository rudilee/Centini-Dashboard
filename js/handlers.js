app.handlers = {
    main: {
        centiniClient: {
            load: function () {
                // Setup fungsi interface panel Centini Client
                $('#centini-client .close').click(app.handlers.main.centiniClient.hide);

                $('#transfer').popover({
                    html: true,
                    placement: 'bottom',
                    container: '#centini-client .panel-body',
                    content: function () {
                        return $('#transfer-popup').html();
                    }
                });

                $('#transfer').on('show.bs.popover', function () {
                    $('#transfer').addClass('active');
                }).on('hide.bs.popover', function () {
                    $('#transfer').removeClass('active');
                });
            },
            show: function (event) {
                $('#centini-client').show();
                $('#centini-client-button').addClass('hidden');
            },
            hide: function (event) {
                $('#centini-client').hide();
                $('#centini-client-button').removeClass('hidden');
            }
        }
    },
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
                    app.common.template('#content-body', 'workspace.html', app.handlers.workspace.loaded)();
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
            $('#centini-client').addClass('hidden');
            $('#external-url').addClass('hidden').attr('src', '');
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
            $('#change-password').click(app.handlers.dashboard.changePassword.show);
            $('#change-password-form').submit(app.handlers.dashboard.changePassword.submit);
            $('#change-password-dialog').on('hidden.bs.modal', app.handlers.dashboard.changePassword.hidden);
            
            $('#content-wrap').removeClass('container').addClass('container-fluid');
            
            $('#centini-client-button').click(app.handlers.main.centiniClient.show);
            $('#logout').click(app.handlers.dashboard.logout);
            
            app.centini.status();
        },
        changePassword: {
            show: function () {
                $('#change-password-dialog').modal();
            },
            hidden: function () {
                $('#change-password-dialog .alert').addClass('hidden');
                
                $('#password').val('');
                $('#new-password').val('');
                $('#new-password-confirm').val('');
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
    workspace: {
        loaded: function (responseText, textStatus, jqXHR) {
            $('#centini-client').removeClass('hidden');
            $('#external-url').removeClass('hidden').attr('src', 'http://192.168.1.8/');
        }
    }
};