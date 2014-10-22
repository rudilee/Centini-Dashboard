var app = {};

jQuery(document).ready(function ($) {
    // Bikin Centini Client buat nanganin komunikasi ke server Centini
    app.centini = new CentiniClient();
    
    // Konek handler buat nanganin event komunikasi Centini Client
    app.centini.on('connected', app.handlers.centini.connected);
    app.centini.on('disconnected', app.handlers.centini.disconnected);
    
    // Konek handler buat nanganin response dari server Centini
    // Response dari Action
    app.centini.onResponse('Login', app.handlers.centini.response.login);
    app.centini.onResponse('Logout', app.handlers.centini.response.logout);
    // Response dari Request
    app.centini.onResponse('Status', app.handlers.centini.response.status);
    app.centini.onResponse('ChangePassword', app.handlers.centini.response.changePassword);
    
    // Konek handler buat nangnanin event dari server Centini
    app.centini.onEvent('ActionReady', app.handlers.centini.event.actionReady);
    app.centini.onEvent('LoggedIn', app.handlers.centini.event.loggedIn);
    app.centini.onEvent('LoggedOut', app.handlers.centini.event.loggedOut);
    app.centini.onEvent('PeerChanged', app.handlers.centini.event.peerChanged);
    app.centini.onEvent('QueueStateChanged', app.handlers.centini.event.queueStateChanged);
    app.centini.onEvent('PhoneStateChanged', app.handlers.centini.event.phoneStateChanged);
    
    // Cache hasil load file2 pake ajax
    $.ajaxSetup({
        cache: app.settings.ajax.cache
    });
	
    // Tampilin form login
    app.common.template('#content-wrap', 'login.html', app.handlers.loginForm.loaded)();
    
    // Setup fungsi2 interface Centini Client
    app.handlers.centini.client.load();
});