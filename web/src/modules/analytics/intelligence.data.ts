// ─────────────────────────────────────────────────────────────
//  Fleet Intelligence — Shared Mock Data
// ─────────────────────────────────────────────────────────────

export interface FleetUnit {
    id: string;
    plate: string;
    driver: string;
    region: 'JAKARTA' | 'JAWA_BARAT' | 'JAWA_TENGAH' | 'JAWA_TIMUR' | 'SUMATERA';
    utilization: number; // 0–100
    revenue: number;     // Rp
    cost: number;        // Rp
    margin: number;      // %
    idleHours: number;
    riskScore: number;   // 0–100 (higher = worse)
    routesCompleted: number;
    kmDriven: number;
}

export interface DayDataPoint {
    date: string;
    revenue: number;
    cost: number;
    utilization: number;
    sla: number;
}

// 18 fleet units with realistic variation
export const FLEET_UNITS: FleetUnit[] = [
    { id: 'v-001', plate: 'B 9012 GHI', driver: 'Cahyo P.', region: 'JAKARTA', utilization: 88, revenue: 45_200_000, cost: 28_100_000, margin: 37.8, idleHours: 1.2, riskScore: 18, routesCompleted: 12, kmDriven: 820 },
    { id: 'v-002', plate: 'B 3456 JKL', driver: 'Deni F.', region: 'JAWA_BARAT', utilization: 82, revenue: 39_800_000, cost: 26_400_000, margin: 33.7, idleHours: 2.4, riskScore: 24, routesCompleted: 10, kmDriven: 710 },
    { id: 'v-003', plate: 'B 1234 ABC', driver: 'Budi S.', region: 'JAKARTA', utilization: 94, revenue: 52_100_000, cost: 29_800_000, margin: 42.8, idleHours: 0.8, riskScore: 12, routesCompleted: 14, kmDriven: 940 },
    { id: 'v-004', plate: 'B 5678 DEF', driver: 'Andi W.', region: 'JAWA_TENGAH', utilization: 76, revenue: 34_000_000, cost: 24_200_000, margin: 28.8, idleHours: 3.2, riskScore: 35, routesCompleted: 9, kmDriven: 640 },
    { id: 'v-005', plate: 'B 7890 MNO', driver: 'Eko P.', region: 'JAWA_TIMUR', utilization: 71, revenue: 29_500_000, cost: 23_100_000, margin: 21.7, idleHours: 4.8, riskScore: 48, routesCompleted: 8, kmDriven: 580 },
    { id: 'v-006', plate: 'B 2468 PQR', driver: 'Fajar N.', region: 'SUMATERA', utilization: 90, revenue: 48_800_000, cost: 27_600_000, margin: 43.4, idleHours: 0.6, riskScore: 14, routesCompleted: 13, kmDriven: 890 },
    { id: 'v-007', plate: 'B 1357 STU', driver: 'Gunawan H.', region: 'JAKARTA', utilization: 58, revenue: 21_200_000, cost: 19_800_000, margin: 6.6, idleHours: 7.2, riskScore: 72, routesCompleted: 5, kmDriven: 380 },
    { id: 'v-008', plate: 'B 8642 VWX', driver: 'Hendra K.', region: 'JAWA_BARAT', utilization: 85, revenue: 41_500_000, cost: 26_900_000, margin: 35.2, idleHours: 1.8, riskScore: 22, routesCompleted: 11, kmDriven: 760 },
    { id: 'v-009', plate: 'B 9753 YZA', driver: 'Irwan M.', region: 'JAWA_TENGAH', utilization: 67, revenue: 26_800_000, cost: 21_400_000, margin: 20.1, idleHours: 5.4, riskScore: 55, routesCompleted: 7, kmDriven: 490 },
    { id: 'v-010', plate: 'D 4321 BCD', driver: 'Joko S.', region: 'JAWA_TIMUR', utilization: 92, revenue: 50_400_000, cost: 28_600_000, margin: 43.3, idleHours: 0.9, riskScore: 11, routesCompleted: 13, kmDriven: 910 },
    { id: 'v-011', plate: 'D 6543 EFG', driver: 'Kukuh R.', region: 'SUMATERA', utilization: 55, revenue: 19_100_000, cost: 18_800_000, margin: 1.6, idleHours: 8.1, riskScore: 82, routesCompleted: 4, kmDriven: 320 },
    { id: 'v-012', plate: 'D 8765 HIJ', driver: 'Lukman A.', region: 'JAKARTA', utilization: 79, revenue: 36_700_000, cost: 25_100_000, margin: 31.6, idleHours: 2.8, riskScore: 30, routesCompleted: 10, kmDriven: 680 },
    { id: 'v-013', plate: 'L 1122 KLM', driver: 'Mochamad Y.', region: 'JAWA_TIMUR', utilization: 97, revenue: 55_800_000, cost: 30_200_000, margin: 45.9, idleHours: 0.3, riskScore: 8, routesCompleted: 15, kmDriven: 1020 },
    { id: 'v-014', plate: 'L 3344 NOP', driver: 'Nugroho B.', region: 'JAWA_BARAT', utilization: 62, revenue: 23_600_000, cost: 20_100_000, margin: 14.8, idleHours: 6.3, riskScore: 61, routesCompleted: 6, kmDriven: 440 },
    { id: 'v-015', plate: 'L 5566 QRS', driver: 'Oki F.', region: 'JAWA_TENGAH', utilization: 73, revenue: 31_200_000, cost: 23_800_000, margin: 23.7, idleHours: 3.8, riskScore: 42, routesCompleted: 9, kmDriven: 620 },
    { id: 'v-016', plate: 'L 7788 TUV', driver: 'Putra D.', region: 'SUMATERA', utilization: 88, revenue: 44_100_000, cost: 27_300_000, margin: 38.1, idleHours: 1.5, riskScore: 19, routesCompleted: 12, kmDriven: 800 },
    { id: 'v-017', plate: 'BK 9900 WXY', driver: 'Rahmat S.', region: 'SUMATERA', utilization: 50, revenue: 16_400_000, cost: 17_600_000, margin: -7.3, idleHours: 9.4, riskScore: 91, routesCompleted: 3, kmDriven: 240 },
    { id: 'v-018', plate: 'BK 2211 ZAB', driver: 'Surya P.', region: 'JAKARTA', utilization: 83, revenue: 38_900_000, cost: 25_800_000, margin: 33.7, idleHours: 2.1, riskScore: 26, routesCompleted: 11, kmDriven: 730 },
];

// 14 days of trend data
export const TREND_DATA: DayDataPoint[] = [
    { date: '07 Feb', revenue: 580, cost: 340, utilization: 74, sla: 91 },
    { date: '08 Feb', revenue: 620, cost: 355, utilization: 76, sla: 92 },
    { date: '09 Feb', revenue: 590, cost: 348, utilization: 73, sla: 90 },
    { date: '10 Feb', revenue: 640, cost: 360, utilization: 78, sla: 93 },
    { date: '11 Feb', revenue: 710, cost: 380, utilization: 82, sla: 94 },
    { date: '12 Feb', revenue: 680, cost: 370, utilization: 80, sla: 93 },
    { date: '13 Feb', revenue: 650, cost: 365, utilization: 79, sla: 92 },
    { date: '14 Feb', revenue: 700, cost: 375, utilization: 81, sla: 93 },
    { date: '15 Feb', revenue: 720, cost: 382, utilization: 83, sla: 94 },
    { date: '16 Feb', revenue: 690, cost: 371, utilization: 80, sla: 92 },
    { date: '17 Feb', revenue: 740, cost: 388, utilization: 85, sla: 95 },
    { date: '18 Feb', revenue: 760, cost: 392, utilization: 87, sla: 95 },
    { date: '19 Feb', revenue: 730, cost: 385, utilization: 84, sla: 94 },
    { date: '20 Feb', revenue: 780, cost: 399, utilization: 88, sla: 96 },
];

// Aggregated KPIs
export const TODAY_KPIS = {
    totalFleet: 18,
    activeToday: 15,
    utilization: 78.2,
    revenuePerFleet: 36_900_000,
    costPerKm: 38_400,
    netMargin: 31.8,
    // vs Yesterday
    vsYesterdayUtilization: +3.2,
    vsYesterdayRevenue: +6.8,
    vsYesterdayCostKm: -1.2,
    vsYesterdayMargin: +2.1,
    // vs Last Week
    vsWeekUtilization: +8.4,
    vsWeekRevenue: +12.3,
    vsWeekCostKm: -3.4,
    vsWeekMargin: +5.2,
};

export const IDLE_COST_PER_HOUR = 500_000; // Rp 500rb/jam
