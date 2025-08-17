import { MetaService } from './meta.service';
export declare class MetaController {
    private readonly metaService;
    constructor(metaService: MetaService);
    getClientStatuses(): string[];
    getVisaTypes(): string[];
    getAttachmentTypes(): string[];
    getServiceTypes(): string[];
    getPaymentOptions(): string[];
    getPaymentModalities(): string[];
}
