import { Injectable } from '@nestjs/common';

@Injectable()
export class ReportsService {
  summary() {
    return { revenue: 0, orders: 0 };
  }
}
