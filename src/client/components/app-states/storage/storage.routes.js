import template from './storage.tpl.html!text';

function storageRoutes( $stateProvider ) {
    $stateProvider
        /*.state( 'app.storage', {
            url: '/storage',
            views: {
                menuContent: {
                    controller: 'storageController as vm',
                    template: template
                }
            }
        } )*/
        .state( 'app.storage', {
            url: '/storage',
            data: { title: 'Storage' },
            views: {
                content: {
                    controller: 'storageController as vm',
                    template: template
                }
            }
        } );
}

export default [
    '$stateProvider', storageRoutes
];
