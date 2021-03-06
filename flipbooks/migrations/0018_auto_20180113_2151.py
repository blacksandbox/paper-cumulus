# -*- coding: utf-8 -*-
# Generated by Django 1.11.2 on 2018-01-13 21:51
from __future__ import unicode_literals

from django.db import migrations, models
import easy_thumbnails.fields
import flipbooks.models


class Migration(migrations.Migration):

    dependencies = [
        ('flipbooks', '0017_frame_frame_image_native'),
    ]

    operations = [
        migrations.AddField(
            model_name='strip',
            name='children_orders',
            field=models.TextField(blank=True, default='', max_length=500),
        ),
        migrations.AlterField(
            model_name='frame',
            name='frame_image',
            field=easy_thumbnails.fields.ThumbnailerImageField(blank=True, upload_to=flipbooks.models.frame_upload_path),
        ),
        migrations.AlterField(
            model_name='frame',
            name='frame_image_native',
            field=models.ImageField(upload_to=flipbooks.models.frame_upload_path2),
        ),
    ]
