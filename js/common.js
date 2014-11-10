/*global app*/
/*global $*/

app.common = {
    error: function (message, title) {
        "use strict";
        
        $('#error-dialog .modal-body').text(message);
        $('#error-dialog .modal-title').text(typeof title === 'undefined' ? 'Terjadi kesalahan' : title);
        $('#error-dialog').modal();
    },
    template: function (selector, template, handler) {
        "use strict";
        
        return function () {
            $(selector).load(app.settings.template.path + '/' + template, handler);
        };
    }
};