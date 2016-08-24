import { IScope, IPromise } from 'angular';

import { CbmesApiService, Warning } from '../shared/index';

export class WarningListController {

    public static $inject: string[] = [
        '$scope',
        '$state',
        '$ionicLoading',
        'cbmesApiService'
    ];

    private warnings: Warning[] = [];
    private activated: boolean = false;
    private populated: boolean = false;

    constructor( private $scope: IScope,
                 private $state: angular.ui.IStateService,
                 private $ionicLoading: ionic.loading.IonicLoadingService,
                 private cbmesApiService: CbmesApiService ) {
        this.$scope.$on( '$ionicView.beforeEnter', () => this.activate() );
    }

    /**
     * Ativa o controller
     */
    public activate(): void {
        this.getWarnings()
            .finally( () => this.populated = true );
    }

    /**
     * Retorna os alertas dos últimos 7 dias 
     * 
     * @returns {IPromise<Warning[]>}
     */
    public getWarnings(): IPromise<Warning[]> {
        return this.cbmesApiService.getLastWarnings()
                                   .then( warnings => this.warnings = warnings );
    }
}