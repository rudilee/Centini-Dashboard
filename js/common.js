app.common = {
    error: function (message) {
        $('#error-dialog .modal-body').text(message);
        $('#error-dialog').modal();
    },
    template: {
        loginForm: function () {
            $('#content-wrap').load('templates/login.html', app.handlers.loginForm.loaded);
        },
        dashboard: function (headers) {
            $('#content-wrap').load('templates/dashboard.html', app.handlers.dashboard.loaded);
        },
        administration: {
            base: function () {
                $('#content-body').load('templates/administration.html', app.handlers.administration.loaded);
            },
            queueStatistics: function () {
                $('#content-panel').load('templates/reports/queue_statistics.html', app.handlers.administration.queueStatistics.loaded);
            }
        }
    }
};