export interface MemberProfit {
    memberId: string;
    profit: number;
}

export interface AnalyticsResponse {
    totalMembers: number;
    totalReports: number;
    totalProfit: number;
    profitByMember: MemberProfit[];
}

export interface AnalyticsData {
    totalMembers: number;
    totalReports: number;
    totalProfit: number;
    profitByMember: Map<string, number>;
}

export function calculateProfitByMember(profitMap: Map<string, number>): MemberProfit[] {
    // Convert profit map to array
    const profitArray = Array.from(profitMap.entries()).map(([memberId, profit]) => ({
        memberId,
        profit: Math.round(profit) // Round to whole numbers
    }));

    // Sort by profit descending
    return profitArray.sort((a, b) => b.profit - a.profit);
}

export function toAnalyticsResponse(data: AnalyticsData): AnalyticsResponse {
    return {
        totalMembers: data.totalMembers,
        totalReports: data.totalReports,
        totalProfit: Math.round(data.totalProfit),
        profitByMember: calculateProfitByMember(data.profitByMember)
    };
}
