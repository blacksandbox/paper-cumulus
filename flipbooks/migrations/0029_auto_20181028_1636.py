# Generated by Django 2.1.1 on 2018-10-28 20:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('flipbooks', '0028_chapter_id64'),
    ]

    operations = [
        migrations.AddField(
            model_name='chapter',
            name='children_li',
            field=models.TextField(blank=True, default='', max_length=600),
        ),
        migrations.AlterField(
            model_name='scene',
            name='children_li',
            field=models.TextField(blank=True, default='', max_length=600),
        ),
    ]
