# Generated by Django 2.1.1 on 2018-12-04 04:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('flipbooks', '0033_scene_id64'),
    ]

    operations = [
        migrations.AddField(
            model_name='chapter',
            name='is_demo',
            field=models.BooleanField(blank=True, default=False),
        ),
    ]
