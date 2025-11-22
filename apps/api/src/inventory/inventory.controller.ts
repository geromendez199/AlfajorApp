import { Controller, Get } from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private inventory: InventoryService) {}

  @Get()
  list() {
    return this.inventory.list();
  }
}
