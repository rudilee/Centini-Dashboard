app.common = {
    template: {
        loginForm: function () {
            $('.container').load('templates/login.html', app.handlers.loginForm.loaded);
        },
        dashboard: function (username) {
            $('.container').load('templates/dashboard.html', app.handlers.dashboard.loaded);
        }
    }
};