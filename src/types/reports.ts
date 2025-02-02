import { ObjectId } from 'mongodb';

export interface ReportDetails {
    location?: string;
    commodity?: string;
    quantity?: number;
    buyPrice?: number;
    sellPrice?: number;
}

export interface Report {
    _id: ObjectId;
    organizationId: ObjectId;
    type: string;
    profit: number;
    participants: string[];
    details?: ReportDetails;
    createdBy: string;
    createdAt: Date;
}

export interface ClientReport {
    id: string;
    organizationId: string;
    type: string;
    profit: number;
    participants: string[];
    details?: ReportDetails;
    createdBy: string;
    createdAt: Date;
}

export function toClientReport(report: Report): ClientReport {
    const { _id, organizationId, ...rest } = report;
    return {
        id: _id.toString(),
        organizationId: organizationId.toString(),
        ...rest
    };
}

export type CreateReportBody = Omit<Report, '_id' | 'organizationId' | 'createdAt'> & {
    organizationId: string;
    createdAt?: string | Date;
};
