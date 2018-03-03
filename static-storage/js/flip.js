/* global $ */
// Above line is to prevent cloud9 from thinking 
// '$' is an undefined variable



var _spinnyObj = new Spinny(); /* global Spinny*/
var _imgHandler = new AJAXImageHandler(); /* global AJAXImageHandler */

// DOMs that will be referenced frequently
var $frameView;
var $frameScrubber;
var $timer;

var $currStrip = -1;

$(function(){
    console.log("* ------- flip.js v.1.14 ------- *");
    var $doc = $(document);
    
    //init global var
    $frameView = $doc.find('.frame_view');
    $frameScrubber = $doc.find(".frame_scrubber");
    $timer = $frameScrubber.find(".timer");
    
    //connect DOM obj to ajax handlers
    _imgHandler.$cellContainer = $doc.find('.cell_container').eq(0); 
    
    init_frame_imgs_and_container();
    var first_frame_loaded = false;
    var imageLoadCount = 0;
    var imageTotalCount = $('.frame_view .frame_load').find("img").length;
    
    // show loading
    _spinnyObj.appendSpinnyTo(
        $('#msg_loading').eq(0),
        {"background-color": "transparent"},
        false);
    
    
    $('.frame_view .frame_load').imagesLoaded()
    .fail( function() {
        console.log('all images loaded, at least one is broken');
    })
    .progress( function( instance, image ) {
        
        // Set width and height of the container
        // This is done here to ensure the width and height of image is avaliable
        if(!(first_frame_loaded)){
            var frame_item = $frameView.find("img.frame_item");
            $frameView.css({"width":frame_item.width()+"px", "height":frame_item.height()+"px"});
            first_frame_loaded = true;
            
            // make all strip visible
            $frameView.find(".strip").css("opacity",1);
        }
    
        imageLoadCount = (image.isLoaded ? 1 : 0) + imageLoadCount;
        // console.log( 'image is ' + result + ' for ' + image.img.src + ": instance: " + $(image.img).attr("src"));
        // console.log("Loaded [ " + imageLoadCount + "/" + imageTotalCount + " ]");
        
        // progress bar
        var $loadingBar = $(document).find('#loading_bar');
        $loadingBar.css("width", (imageLoadCount/imageTotalCount)*100 + "%");
        
    })
    .always( function( instance ) {
        //all images loaded
    })
    .done( function( instance ) {
        //load_more_strips();
        
        //hide cover
        $(document).find(".cover").children("#msg_loading").hide();
        $(document).find(".cover").children("#msg_instruction").show();
        
        
        
        //bind keyboard event
        document.addEventListener("keydown", function(){
        
            if (event.code === "ArrowRight"){ //next
                play_nextFrame();
            }
            else if(event.code === "ArrowLeft"){ //previous
                play_prevFrame();
            }
            
        }); //keyevent listener
        
    });

    
});



/*-----------------------------------------------------------------
-----------------------------helpers-------------------------------
-------------------------------------------------------------------*/

//...........constants............
var t_step = 400; //ms

//init_frame_imgs()...............
//Only works after img DOM has been loaded. 
//Adds proper z-index and display_order attributes to the frames
function init_frame_imgs_and_container(){
    // removed code for setting z-index value for individual frame_item
}

function play_prevFrame(){
    
    //no animation, simply jump to last frame of previous strip
    
    // identify previous strip to show
    if ($currStrip != -1){
        //unstage currStrip
        unstageStrip($currStrip);
        //grab previous one
        var $tempPrevStrip = $currStrip.prev(".strip");
        if ($tempPrevStrip.length > 0 && $tempPrevStrip.attr("class") == "strip"){
            // TODO: distinguish between staging to previous strip
            //       vs. rewind current strip to the beginning.
            $currStrip = $tempPrevStrip;
            stageStrip($currStrip);
        } else {
            $currStrip = -1; //reset
        }
        
        //Update timer. Small icon right beneath the main stage
        updateTimer($currStrip);
    
        // Show scrubber 
        // $frameScrubber.css("opacity", 1);
        // // Start timer to close it
        // setTimeout(function(){ 
        //     $frameScrubber.css("opacity", 0);
        // }, 5000);
        
        
    } else { 
        // User at the beginning. Do Nothing.
        return; 
        
    }
}

function play_nextFrame(){

    var timeline = [];
    var first_play = false;
    
    //check if it is not covered
     if ($(document).find(".cover").css("display") != "none"){
        first_play = true;
        $(document).find(".frame_view .cover").css("display","none");
        $(document).find("img.frame_item").eq(0).attr("viewable",true);
    }
    
    // identify next strip to play
    if ($currStrip == -1){
        //currStripId not set. Select the first one in the queue
        $currStrip = $(document).find(".frame_load").find(".strip").eq(0);
    } else {
        //grab next one
        $currStrip = $currStrip.next(".strip");
    }
    
    //Update timer. Small icon right beneath the main stage
    // get number of frames in this frame_set
    updateTimer($currStrip);
  
        
    // stage current strip. Stage's z-index is 1000
    // TODO: I don't think this is efficient way to unstage previous .strip
    $(document).find(".strip").css("z-index", 1); 
    stageStrip($currStrip);
    
    //get "timeline"
    console.log("Playing strip " + $currStrip.attr("stripid") + ", has " + $currStrip.children(".frame_item").length + " frames");
    timeline = get_timeline($currStrip.children(".frame_item").length, t_step);
    console.log("----------Timeline GET: " + timeline);
    
    //set chain of setTimeOuts
    // It must be done in reverse, because item that is spawned the latest is on top
    var total = $currStrip.children(".frame_item").length-1;
    $currStrip.children(".frame_item").each(function(index){
        if (index > 0) {
            // do not apply it to the last frame of strip. It must stay visible.
            setTimeout(playFrame.bind(null, $(this)), timeline[total-index]);
        }
    });
    
}



//makes "timeline" for setTimeOut for reach items
function get_timeline(count, delay){
    if (delay == undefined){
        delay = 0;
    }
    var timeline = [];
    
    for (var i=0; i<count-1; i++){
        timeline.push(t_step*i + delay);
    }
    return timeline
}

// 'Plays the frame by hiding the given frame_obj, revealing the
// one right beneath it. It creates an illusion of image update.
function playFrame(frame_obj){

    frame_obj.hide();
    
    //update timer
    // Note: frame_obj is spawned in document in reverse order 
    var reverseCount = frame_obj.parent().find('.'+frame_obj.attr("class")).index(frame_obj);
        reverseCount = Number(reverseCount)*(-1)
    $timer.find('.frame_icon').eq(reverseCount).addClass('on');
    
}

function updateTimer($currStrip){
    $timer.html('');
    
    if ($currStrip != -1){
        var stepCount = $currStrip.children('img').length;
        for (var i=0; i<stepCount; i++){
            $('<span class="frame_icon"></span>').appendTo($timer);
        }
    }
    return;
    
}

function unstageStrip(strip_obj){
    strip_obj.css("z-index", 1);
}
function stageStrip(strip_obj){
    strip_obj.css("z-index", 1001);
    strip_obj.find('.frame_item').show();
}


// Requests more strip through a function-view.
// Once successful, appends them.
function load_more_strips(){
    
    $.ajax({
        url: '/flipbooks/ajax/load_more_strips',
        data: {
            'scene_order': 1,
            'num_stripset_loaded':3
        },
        dataType: 'json',
        success: function (data) {
            // TODO: alert_msg function will not work
            //       due to removal of the alert container
            // alert_msg("Retrieving more frames")
            add_strips(data);
            // alert_msg("More frames retrieved")
        }
    });
}

// Adds additional frames retrieved from the ajax call
function add_strips(data){

    var frame_load_container = $(document).find(".frame_view > .frame_load");
    
    var new_strip;
    $.each(data, function(key, img_url){
        //prep strip container
        new_strip = $('<span class="strip"></span>');
        new_strip.appendTo(frame_load_container);
         
        //get information on the last displayable frame
        var last_frame = $frameView.find('img.frame_item').last()
        var last_z_index = last_frame.css("z-index")-1;
        
        //parse
        $.each(img_url, function(i, url){
            console.log("appending strip: " + url);
            
            var new_frame = $('<img class="frame_item"/>');
            new_frame.attr("src", url);
            new_frame.css("z-index", last_z_index);
            new_frame.appendTo(new_strip);
            
            last_z_index-=1;
        });
        
    });
}
    
/* alert box related*/
function alert_msg(msg){
    var msg_box = $(document).find('.alert.alert-info');
    if(msg_box.length >= 1){
        console.log("msg box found");
        msg_box.children('.msg').text(msg);
        return true;
    } else {return false;}
}