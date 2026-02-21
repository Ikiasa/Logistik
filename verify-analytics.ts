
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { OpsAnalyticsService } from './src/analytics/ops-analytics.service';

async function verifyAnalytics() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const service = app.get(OpsAnalyticsService);

    // Get a tenant ID from the database
    const db = await app.get('Pool');
    const tenantRes = await db.query('SELECT id FROM tenants LIMIT 1');
    const tenantId = tenantRes.rows[0].id;

    console.log(`Verifying for Tenant: ${tenantId}`);

    console.log('\n--- HEATMAP DATA ---');
    const heatmap = await service.getHeatmapData(tenantId);
    console.log(`Found ${heatmap.length} clusters.`);
    if (heatmap.length > 0) console.log('Sample Cluster:', heatmap[0]);

    console.log('\n--- FLEET UTILIZATION ---');
    const utilization = await service.getFleetUtilization(tenantId);
    console.log(`Found data for ${utilization.length} vehicles.`);
    if (utilization.length > 0) console.log('Sample Utilization:', utilization[0]);

    console.log('\n--- SLA PERFORMANCE ---');
    const sla = await service.getSLAPerformance(tenantId);
    console.log(`On-Time Rate: ${sla.onTimeRate}%`);
    console.log(`Avg Delay: ${sla.avgDelayMinutes}m`);

    await app.close();
}

verifyAnalytics().catch(console.error);
