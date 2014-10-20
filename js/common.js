app.common = {
    error: function (message, title) {
        $('#error-dialog .modal-body').text(message);
        $('#error-dialog .modal-title').text(typeof title === 'undefined' ? 'Terjadi kesalahan' : title);
        $('#error-dialog').modal();
    },
    template: function (selector, template, handler) {
        return function () {
            $(selector).load(app.settings.template.path + '/' + template, handler);
        }
    }
};