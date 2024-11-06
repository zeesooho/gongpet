import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { PetService } from './pet.service';
import { JwtAccessGuard } from 'src/auth/guard/jwt-access.guard';
import { User } from 'src/auth/decorator/user.decorator';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';

@Controller('pets')
@UseGuards(JwtAccessGuard)
export class PetController {
  constructor(private readonly petService: PetService) {}

  @Post()
  create(@User() user, @Body() dto: CreatePetDto) {
    return this.petService.create(user.userId, dto);
  }

  @Get()
  getMyPets(@User() user) {
    return this.petService.getMyPets(user.userId);
  }

  @Put(':id')
  update(@User() user, @Param('id', ParseIntPipe) petId: number, @Body() dto: UpdatePetDto) {
    return this.petService.update(user.userId, petId, dto);
  }

  @Delete(':id')
  delete(@User() user, @Param('id', ParseIntPipe) petId: number) {
    return this.petService.delete(user.userId, petId);
  }

  @Get(':id')
  getPetById(@User() user, @Param('id', ParseIntPipe) petId: number) {
    return this.petService.getPetById(user.userId, petId);
  }
}
