import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ProfileService } from '@app/profile/profile.service';
import { User } from '@app/user/decorators/user.decorator';
import { ProfileResponseInterface } from '@app/profile/types/profileResponse.interface';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Profiles')
@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':username')
  @ApiOperation({ summary: 'Get profile' })
  async getProfile(@User('id') currentUserId: number, @Param('username') profileUsername: string ): Promise<ProfileResponseInterface> {
    const profile = await this.profileService.getProfile(currentUserId, profileUsername);
    return this.profileService.buildProfileResponse(profile);
  }

  @Post(':username/follow')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('Token')
  @ApiOperation({ summary: 'Follow user' })
  async followProfile(@User('id') currentUserId: number, @Param('username') profileUsername: string ): Promise<ProfileResponseInterface> {
    const profile = await this.profileService.followProfile(currentUserId, profileUsername);
    return this.profileService.buildProfileResponse(profile);
  }

  @Delete(':username/follow')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('Token')
  @ApiOperation({ summary: 'Unfollow user' })
  async unfollowProfile(@User('id') currentUserId: number, @Param('username') profileUsername: string ): Promise<ProfileResponseInterface>{
    const profile= await this.profileService.unfollowProfile(currentUserId, profileUsername);
    return this.profileService.buildProfileResponse(profile);
  }
}