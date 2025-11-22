import { Controller, Get } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private reports: ReportsService) {}

  @Get('summary')
  summary() {
    return this.reports.summary();
  }
}
