import ToastService from '../shared/toast/toast.service';
import OAuth2 from '../shared/authentication/oAuth2Factory.service';
import OAuthDigits from '../shared/authentication/oAuthDigits.service';
import OAuthFacebook from '../shared/authentication/oAuthFacebook.service';
import OAuthGoogle from '../shared/authentication/oAuthGoogle.service';

class LoginController {

    private user = {};
    private tokenClaims;
    private errorMsgs = {
        accountNotLinked: 'Usuário não encontrado.'
    };

    /**
     * @constructor
     *
     * @param $state
     * @param OAuth2
     * @param OAuthDigits
     * @param OAuthFacebook
     * @param OAuthGoogle
     * @param dialog
     * @param toast
     * @param settings
     * @param $window
     * @param $ionicHistory
     * @param $ionicLoading
     */
    constructor( private $state,
                 private OAuth2:OAuth2,
                 private OAuthDigits:OAuthDigits,
                 private OAuthFacebook:OAuthFacebook,
                 private OAuthGoogle:OAuthGoogle,
                 private dialog,
                 private toast:ToastService,
                 private settings,
                 private $window,
                 private $ionicHistory,
                 private $ionicLoading ) {

        this.OAuth2.initialize( settings.identityServer.url );

        this.activate();
    }

    /**
     *
     */
    activate() {
        this.tokenClaims = this.OAuth2.tokenClaims;
    }

    /**
     *
     */
    goToDashboard() {
        this.$ionicHistory.nextViewOptions( {
            disableAnimate: true,
            historyRoot: true
        } );

        this.$state.go( 'app.dashboard.newsHighlights' );
    }

    /**
     *
     * @param data
     * @returns {boolean}
     */
    isAccountNotLinked( data ) {
        return data.error == this.errorMsgs.accountNotLinked;
    }

    /**
     *
     */
    showDialogAccountNotLinked() {
        this.dialog.confirm( {
            title: 'Conta não vinculada',
            content: 'Acesse utilizando o usuário e senha ou clique para criar uma nova conta',
            ok: 'Criar conta'
        } ).then( () => {
            this.$window.open( 'https://acessocidadao.es.gov.br/Conta/VerificarCPF', '_system' );
        } );
    }

    /**
     *
     */
    signInSuccess() {
        this.user = {};
        this.goToDashboard();
    }

    /**
     *
     * @param clientId
     * @param clientSecret
     * @param grantType
     * @param scope
     * @returns {{client_id: any, client_secret: any, grant_type: any, scope: any}}
     */
    getDataIdentityServer( clientId, clientSecret, grantType, scope ) {
        let data = {
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: grantType,
            scope: scope
        };

        return data;
    }

    getDataIdentityServerAcessoCidadao( options, username, password ) {
        let data = {};

        if ( username ) {
            data.username = username;
        }
        if ( password ) {
            data.password = password;
        }

        return angular.extend( {}, options, data );
    }

    getDataIdentityServerSocialNetwork( options, provider, accesstoken ) {
        let data = {};

        if ( provider ) {
            data.provider = provider;
        }

        if ( accesstoken ) {
            data.accesstoken = accesstoken;
        }

        return angular.extend( {}, options, data );
    }

    getDataIdentityServerPhone( options, provider, apiUrl, authHeader ) {
        let data = {};

        data.accesstoken = 'token';

        if ( provider ) {
            data.provider = provider;
        }

        if ( apiUrl ) {
            data.apiUrl = apiUrl;
        }

        if ( authHeader ) {
            data.authHeader = authHeader;
        }

        return angular.extend( {}, options, data );
    }

    /**
     * Executa login na aplicação de acordo com as configurações do settings, usuário e senha.
     */
    signIn() {
        let isData = this.getDataIdentityServer( this.settings.identityServer.clients.espm.id, this.settings.identityServer.clients.espm.secret, 'password', 'openid' );
        isData = this.getDataIdentityServerAcessoCidadao( isData, this.user.name, this.user.password );

        this.$ionicLoading.show();
        this.OAuth2.signIn( isData ).then( () => {
            this.signInSuccess();
        }, () => {
            //TODO: Tratar error
            this.toast.error( {
                title: 'Credenciais inválidas'
            } );
        } )
            .finally( () => {
                this.$ionicLoading.hide();
            } );
    }

    /**
     * https://github.com/jeduan/cordova-plugin-facebook4
     */
    facebookLogin() {
        this.OAuthFacebook.login( ['email', 'public_profile'], ( responseFacebook ) => {
            //Com o token do facebook, busca o token do acesso cidadão
            let isData = this.getDataIdentityServer( this.settings.identityServer.clients.espmExternalLoginAndroid.id, this.settings.identityServer.clients.espmExternalLoginAndroid.secret, 'customloginexterno', 'openid' );
            isData = this.getDataIdentityServerSocialNetwork( isData, 'Facebook', responseFacebook.authResponse.accessToken );

            this.$ionicLoading.show();
            this.OAuth2.signIn( isData ).then( () => {
                this.signInSuccess();
            }, ( error ) => {
                if ( this.isAccountNotLinked( error.data ) ) {
                    this.showDialogAccountNotLinked();
                } else {
                    this.toast.error( {
                        title: 'Falha no Login'
                    } );
                }
            } )
                .finally( () => {
                    this.$ionicLoading.hide();
                } );
        }, () => {
            this.toast.error( {
                title: '[Facebook] Falha no login'
            } );
        } );
    }

    googleLogin() {
        let options = {
            'scopes': 'profile email', // optional, space-separated list of scopes, If not included or empty, defaults to `profile` and `email`.
            'webClientId': this.settings.googleWebClientId, // optional clientId of your Web application from Credentials settings of your project - On Android, this MUST be included to get an idToken. On iOS, it is not required.
            'offline': true // optional, but requires the webClientId - if set to true the plugin will also return a serverAuthCode, which can be used to grant offline access to a non-Google server
        };

        this.OAuthGoogle.login( options, ( responseGoogle ) => {
            //Com o token do google, busca o token do acesso cidadão
            let isData = this.getDataIdentityServer( this.settings.identityServer.clients.espmExternalLoginAndroid.id, this.settings.identityServer.clients.espmExternalLoginAndroid.secret, 'customloginexterno', 'openid' );
            isData = this.getDataIdentityServerSocialNetwork( isData, 'Google', responseGoogle.oauthToken );

            this.$ionicLoading.show();
            this.OAuth2.signIn( isData ).then( () => {
                this.signInSuccess();
            }, ( error ) => {
                if ( this.isAccountNotLinked( error.data ) ) {
                    this.showDialogAccountNotLinked();
                } else {
                    this.toast.error( {
                        title: 'Falha no Login'
                    } );
                }
            } )
                .finally( () => {
                    this.$ionicLoading.hide();
                } );
        }, () => {
            this.toast.error( {
                title: '[Google] Falha no login'
            } );
        } );
    }

    digitsLogin() {

        this.OAuthDigits.login( {}, ( responseDigits ) => {
            //Com o token do digits, busca o token do acesso cidadão
            let isData = this.getDataIdentityServer( this.settings.identityServer.clients.espmExternalLoginAndroid.id, this.settings.identityServer.clients.espmExternalLoginAndroid.secret, 'customloginexterno', 'openid' );
            isData = this.getDataIdentityServerPhone( isData, 'Celular', responseDigits['X-Auth-Service-Provider'], responseDigits['X-Verify-Credentials-Authorization'] );

            this.$ionicLoading.show();
            this.OAuth2.signIn( isData ).then( () => {
                this.signInSuccess();
            }, ( error ) => {
                if ( this.isAccountNotLinked( error.data ) ) {
                    this.showDialogAccountNotLinked();
                } else {
                    this.toast.error( {
                        title: 'Falha no Login'
                    } );
                }
            } )
                .finally( () => {
                    this.$ionicLoading.hide();
                } );
        }, () => {
            this.toast.error( {
                title: '[SMS] Falha no login'
            } );
        } );
    }

    openUrlForgotPassword() {
        this.$window.open( 'https://acessocidadao.es.gov.br/Conta/SolicitarReinicioSenha', '_system' );
    }
}

LoginController.$inject = [
    '$state',
    'OAuth2',
    'OAuthDigits',
    'OAuthFacebook',
    'OAuthGoogle',
    'dialog',
    'toast',
    'settings',
    '$window',
    '$ionicHistory',
    '$ionicLoading'
];

export default LoginController;
