var app = {};

jQuery(document).ready(function ($) {
    // Bikin Centini client buat nanganin komunikasi ke server Centini
    app.centini = new CentiniClient();
    
    // Konek handler buat nanganin event komunikasi Centini client
    app.centini.on('connected', app.handlers.centini.connected);
    app.centini.on('disconnected', app.handlers.centini.disconnected);
    
    // Konek handler buat nanganin response dari server Centini
    app.centini.onResponse('Login', app.handlers.centini.response.login);
    app.centini.onResponse('Logout', app.handlers.centini.response.logout);
    
    app.centini.onResponse('Status', app.handlers.centini.response.status);
    app.centini.onResponse('ChangePassword', app.handlers.centini.response.changePassword);
    
    // Konek handler buat nangnanin event dari server Centini
    app.centini.onEvent('ActionReady', app.handlers.centini.event.actionReady);
    
    // Cache hasil load file2 pake ajax
    $.ajaxSetup({
        cache: app.settings.ajax.cache
    });
	
    // Tampilin form login
    app.common.template.loginForm();
});