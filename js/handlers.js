app.handlers = {
    centini: {
        connected: function () {
            console.log('Centini Client connected..');
        },
        disconnected: function () {
            app.handlers.centini.response.logout();
            
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
            transfer: function (headers) {
                if (headers.success) {
                    $('#transfer').popover('hide');
                }
            },
            status: function (headers) {
                $('#user-fullname').text(headers.fullname);
                $('#peer-extension').val(headers.peer);
                
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
            },
            loggedIn: function (headers) {
                ;
            },
            loggedOut: function (headers) {
                ;
            },
            peerChanged: function (headers) {
                $('#peer-extension').val(headers.peer);
            },
            queueStateChanged: function (headers) {
                switch (headers.queue_state) {
                    case 'Joined':
                        $('#resume').attr('disabled', '');
                        $('#pause-reason').removeAttr('disabled').val('Pilih reason..');
                        break;
                    case 'Paused':
                        $('#resume').removeAttr('disabled');
                        $('#pause-reason').attr('disabled', '');
                        break;
                    case 'None':
                        $('#resume').attr('disabled', '');
                        $('#pause-reason').attr('disabled', '');
                }
            },
            phoneStateChanged: function (headers) {
                switch (headers.phone_state) {
                    case 'Busy':
                        $('#transfer').removeAttr('disabled');
                        $('#centini-client .dialpad button').removeAttr('disabled');
                    case 'Ringing':
                        $('#dial').attr('disabled', '');
                        $('#hangup').removeAttr('disabled');
                        break;
                    case 'Clear':
                        $('#phone-number').val('');
                        $('#dial').removeAttr('disabled');
                        $('#transfer').attr('disabled', '');
                        $('#transfer').popover('hide');
                        $('#hangup').attr('disabled', '');
                        $('#centini-client .dialpad button').attr('disabled', '');
                }
            }
        },
        client: {
            load: function () {
                // Setup fungsi interface panel Centini Client
                $('#centini-client .close').click(app.handlers.centini.client.hide);

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
                }).on('shown.bs.popover', function () {
                    $('#centini-client .popover .proceed-transfer').click(app.handlers.centini.client.transfer);
                }).on('hide.bs.popover', function () {
                    $('#transfer').removeClass('active');
                });
                
                $('#pause-reason').change(app.handlers.centini.client.pause);
                $('#resume').click(app.handlers.centini.client.resume);
                $('#dial').click(app.handlers.centini.client.dial);
                $('#hangup').click(app.handlers.centini.client.hangup);
                $('.dialpad button').click(app.handlers.centini.client.digit);
            },
            show: function (event) {
                $('#centini-client').show();
                $('#centini-client-button').hide();
            },
            hide: function (event) {
                $('#centini-client').hide();
                $('#centini-client-button').show();
            },
            pause: function (event) {
                var reason = $(this).val();
                
                if (reason !== '') {
                    app.centini.pause(true, reason);
                }
            },
            resume: function (event) {
                app.centini.pause(false);
            },
            dial: function (event) {
                var destination = $('#phone-number').val();
                
                if (typeof destination !== 'undefined') {
                    app.centini.dial(destination);
                }
            },
            transfer: function (event) {
                var destination = $('#centini-client .popover .transfer-number').val();
                
                if (typeof destination !== 'undefined') {
                    app.centini.transfer(destination);
                }
            },
            hangup: function (event) {
                app.centini.hangup();
            },
            digit: function (event) {
                app.centini.sendDigit(this.dataset.digit);
            }
        }
    },
    loginForm: {
        loaded: function (responseText, textStatus, jqXHR) {
            $('#centini-client').hide();
            $('#external-url').hide().attr('src', '');
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
            
            $('#centini-client-button').click(app.handlers.centini.client.show);
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
            $('#centini-client').show();
            $('#external-url').show().attr('src', 'http://192.168.1.8/');
        }
    }
};