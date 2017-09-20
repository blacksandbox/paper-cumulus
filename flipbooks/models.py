# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib import messages

from easy_thumbnails.fields import ThumbnailerImageField
from easy_thumbnails.signals import saved_file
from easy_thumbnails.signal_handlers import generate_aliases_global


from django.db import models


# thumbnail signal handler
saved_file.connect(generate_aliases_global)

# Scene: holds multiple strips. In convensional web-comic sense, this is like a "page"
class Scene(models.Model):
    
    order = models.IntegerField(default="0") 
    order_list = models.TextField(max_length=200, default="")
    
    name = models.CharField(max_length=50, blank=True, default="")
    description = models.TextField(max_length=100, blank=True, default="")
    
    
    
    #chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE)
    
    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        # https://docs.python.org/2/library/stdtypes.html#str.format
        return "Scene order: {}".format(self.order)
        
        # >>> gender= "male"
        # >>> print "At least, that's what %s told me." %("he" if gender == "male" else "she")
        # At least, that's what he told me.


# -------------------------------------------------
# -------------------------------------------------
#                     Strip
# -------------------------------------------------
# -------------------------------------------------

#helper 
def get_last_order(strip_instance):
    scene = strip_instance.scene
    return len(scene.strip_set.all())+1

def recatalog_order(scene_instance, new_order):
    print("-------------RECATALOG ORDER FOR SCENE {}".format(scene_instance.id))
    scene = scene_instance
    new_order_list = []
    
    #am I trying to make space?
    index = 1
    for strip in scene.strip_set.all():
        if index != new_order:
            new_order_list.append(strip.id)
            #TODO: reupdate strip's order?
            #       Or do I ignore? If I leave it as it is
            #       It might be harder to retrieve the strips in order
        
        index+=1

    return ','.join(str(order) for order in new_order_list)
        
    

# Strip: holds multiple frames. Used for viewing frames.
class Strip(models.Model):
    
    order = models.IntegerField(default="0")
    
    description = models.TextField(max_length=100, blank=True, default="")
    
    scene = models.ForeignKey(Scene, on_delete=models.CASCADE)
    
    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        # https://docs.python.org/2/library/stdtypes.html#str.format
        return "Sn:{} - Order:{}".format(self.scene.order, self.order)
    
    # def get_absolute_url(self):
    #     return reverse("chatter:detail", kwargs={"pk":self.pk})
    
    def save(self):
        #add better order if it is set 0
        if int(self.order) == 0:
            self.order = get_last_order(self)
            
        #re-register order_list for its scene
        super(Strip, self).save()
        
        #TODO: this doesn't work ):
        scene = self.scene
        scene.order_list = recatalog_order(self.scene, self.order)
        print("------new order list:{}".format(scene.order_list))
        scene.save()
        
        
        
        
        
def frame_upload_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT/scene_<order>/strip_<order>-<order>.<ext>
    
    return 'frame_images/scene_{0}_{1}/strip_{2}-{3}.{4}'.format(
        instance.strip.scene.id, 
        instance.strip.scene.name,
        instance.strip.order,
        instance.order,
        filename.split(".")[-1]
        )
        
        
#Frame: holds individual frames
class Frame(models.Model):
    
    order = models.IntegerField(default="0") 

    note = models.CharField(
        max_length=100, blank=True, default="", help_text="This note will not be visible for viewers. It's just for the creator"
    )
    
    strip = models.ForeignKey(Strip, blank=True, null=True)
    
    #frame images
    frame_image = ThumbnailerImageField(
        upload_to = frame_upload_path,
        #resize_source=dict(size=(100, 100)),
        #thumbnail_storage='frame_images/thumbTest/thumbs/', #I don't know how to use this
        blank=True
    )
    
    
    
    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)
    
    
    
    def __str__(self):
        return ("%d : %s" % (self.id, self.note))



