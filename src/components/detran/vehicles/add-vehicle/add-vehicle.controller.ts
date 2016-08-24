import { ToastService } from '../../../shared/toast/index';
import { VehicleStorage } from '../../shared/index';

export class AddVehicleController {

    public static $inject: string[] = [ '$mdDialog', 'detranStorage', 'toast' ];

    /**
     * Creates an instance of AddVehicleController.
     * 
     * @param {angular.material.IDialogService} $mdDialog
     * @param {VehicleStorage} vehicleStorage
     * @param {ToastService} toast
     */
    constructor( private $mdDialog: angular.material.IDialogService,
                 private vehicleStorage: VehicleStorage,
                 private toast: ToastService ) {}


    /**
     * 
     */
    public cancel() {
        this.$mdDialog.cancel();
    }


    /**
     * 
     * 
     * @param {string} plate
     * @param {string} renavam
     * @returns
     */
    public ok( plate: string, renavam: string ) {

        if ( !plate ) {
            this.toast.info( { title: 'Placa é obrigatória' } ); return;
        }

        if ( !renavam ) {
            this.toast.info( { title: 'RENAVAM é obrigatório' } ); return;
        }

        const vehicle = {
            plate: plate.toUpperCase(),
            renavam: renavam.toUpperCase()
        };

        if ( this.vehicleStorage.existsVehicle( vehicle ) ) {
            this.toast.error( { title: `Placa ou RENAVAM já cadastrado(s)` } ); return;
        }

        this.$mdDialog.hide( vehicle );
    }
}

