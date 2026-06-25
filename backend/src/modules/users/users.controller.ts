import { Controller, Get, UseGuards, Request, Patch, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

@UseGuards(JwtAuthGuard)
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@Request() req: any) {
    return this.usersService.findById(req.user.id);
  }

  @Patch('me')
  async updateMe(@Request() req: any, @Body() body: UpdateUserDto) {
    return this.usersService.update(req.user.id, body);
  }
}
