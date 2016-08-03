import './bus-lines.component.css';
import template from './bus-info.component.html';
import { BusInfoController } from './bus-info.component.controller';

const directive = () => {
    return {
        template: template,
        controller: BusInfoController,
        restrict: 'E',
        controllerAs: 'vm', // scope: {},
        replace: true,
        bindToController: true
    };
};

export default directive;
