import { Controller, Get, Post, Body, Param, UsePipes } from '@nestjs/common';
import { MediaService } from './media.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { ValidationPipe } from '@nestjs/common';

@Controller('v1/media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('create')
  @UsePipes(new ValidationPipe())
  create(@Body() createMediaDto: CreateMediaDto) {
    return this.mediaService.create(createMediaDto);
  }

  @Get('list')
  findAll() {
    return this.mediaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mediaService.findOne(+id);
  }

  @Post('update/:id')
  update(@Param('id') id: string, @Body() updateMediaDto: UpdateMediaDto) {
    return this.mediaService.update(+id, updateMediaDto);
  }

  @Post('delete/:id')
  remove(@Param('id') id: string) {
    return this.mediaService.remove(+id);
  }
}
