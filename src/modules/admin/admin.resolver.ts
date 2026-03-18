
import { Resolver, Query } from '@nestjs/graphql';
import { AdminService } from './admin.service';
import { AdminDashboardResponse } from './dto/admin-dashboard.dto';

@Resolver()
export class AdminResolver {
  constructor(private readonly adminService: AdminService) {}

  @Query(() => AdminDashboardResponse)
  async getDashboard() {
    return this.adminService.getDashboardData();
  }
}
