app.handlers = {
    centini: {
        connected: function () {
            console.log('Centini Client connected..');
        },
        disconnected: function () {
            app.handlers.centini.client.duration.stop();
            app.handlers.centini.response.logout();
            
            $('#pause-reason').val('Pilih reason..');
            $('#users-monitor').hide();
            
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
                $('#pause-reason').val(typeof headers.pause_reason === 'undefined' ? 'Pilih reason..' : headers.pause_reason);
                
                app.models.centini.client.username = headers.username;
                app.models.centini.client.fullname = headers.fullname;
                app.models.centini.client.level = headers.level;
                app.models.centini.client.duration = headers.duration;
                
                if (headers.level === 'Administrator') {
                    app.common.template('#content-body', 'administration.html', app.handlers.administration.loaded)();
                } else if (['Supervisor', 'Manager'].indexOf(headers.level) > -1) {
                    $('#centini-client-button').show();
                    $('#users-monitor').show();
                } else if (headers.level === 'Agent') {
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
                var client = $('#client-template').clone();
                
                client.attr('id', headers.username);
                client.appendTo('#users-monitor > .row');
                
                $('#' + headers.username + ' .username').text(headers.username);
                
                app.handlers.centini.event.queueStateChanged(headers);
                app.handlers.centini.event.phoneStateChanged(headers);
            },
            loggedOut: function (headers) {
                $('#' + headers.username).remove();
            },
            peerChanged: function (headers) {
                if (typeof headers.username === 'undefined') {
                    $('#peer-extension').val(headers.peer);
                }
            },
            queueStateChanged: function (headers) {
                if (headers.username === app.models.centini.client.username) {
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
                }
            },
            phoneStateChanged: function (headers) {
                if (headers.username === app.models.centini.client.username) {
                    switch (headers.phone_state) {
                        case 'Busy':
                            app.handlers.centini.client.duration.start();

                            $('#mute').removeAttr('disabled');
                            $('#transfer').removeAttr('disabled');
                            $('#centini-client .dialpad button').removeAttr('disabled');
                        case 'Ringing':
                            $('#dial').attr('disabled', '');
                            $('#hangup').removeAttr('disabled');
                            break;
                        case 'Clear':
                            $('#phone-number').val('');

                            app.handlers.centini.client.duration.stop();

                            $('#dial').removeAttr('disabled');
                            $('#mute').attr('disabled', '');
                            $('#transfer').attr('disabled', '');
                            $('#transfer').popover('hide');
                            $('#hangup').attr('disabled', '');

                            $('#centini-client .dialpad button').attr('disabled', '');
                            break;
                    }
                } else {
                    var client = $('#' + headers.username + ' > .panel');
                    client.removeClass();
                    
                    switch (headers.phone_state) {
                        case 'Busy':
                            client.addClass('panel panel-danger');
                            break;
                        case 'Ringing':
                            client.addClass('panel panel-warning');
                            break;
                        case 'Clear':
                        default:
                            client.addClass('panel panel-default');
                            break;
                    }
                }
            }
        },
        client: {
            load: function () {
                // Setup fungsi interface panel Centini Client
                $('#centini-client .close').click(app.handlers.centini.client.hide);
                
                var pauseReason = $('#pause-reason');
                for (var reason in app.settings.centini.reason) {
                    pauseReason.append('<option value="' + reason + '">' + app.settings.centini.reason[reason] + '</option>');
                }

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
                $('#mute').click(app.handlers.centini.client.hold);
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
            duration: {
                intervalId: null,
                start: function () {
                    app.models.centini.client.duration = 0;
                    
                    $('#phone-number-duration').addClass('input-group');
                    $('#call-duration').removeClass('hidden');
                    
                    if (app.models.centini.client.intervalId !== null) {
                        window.clearInterval(app.models.centini.client.intervalId);
                    }
                    
                    app.models.centini.client.intervalId = window.setInterval(app.handlers.centini.client.duration.interval, 1000);
                },
                stop: function () {
                    $('#phone-number-duration').removeClass('input-group');
                    $('#call-duration').text('00:00:00').addClass('hidden');
                    
                    app.models.centini.client.duration = 0;
                    
                    if (app.models.centini.client.intervalId !== null) {
                        window.clearInterval(app.models.centini.client.intervalId);
                    }
                },
                interval: function () {
                    var duration = app.handlers.centini.client.duration.format(++app.models.centini.client.duration);
                    
                    $('#call-duration').text(duration);
                },
                format: function (sec_num) {
                    // Sumber: http://stackoverflow.com/a/6313008
                    
                    var hours = Math.floor(sec_num / 3600);
                    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
                    var seconds = sec_num - (hours * 3600) - (minutes * 60);

                    if (hours < 10) {
                        hours = "0" + hours;
                    }
                    
                    if (minutes < 10) {
                        minutes = "0" + minutes;
                    }
                    
                    if (seconds < 10) {
                        seconds = "0" + seconds;
                    }
                    
                    return hours + ':' + minutes + ':' + seconds;
                }
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
            hold: function (event) {
                app.centini.hold(true);
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