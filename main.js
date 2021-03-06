var appPath = "https://flickering-fire-8187.firebaseio.com/";
var appName = "Todo";

var App = new Firebase(appPath + appName);

if (localStorage.getItem('storagelist') === null) {
    localStorage.setItem('storagelist', 'Grocery');
    listName = localStorage.getItem('storagelist');
} else {
  listName = localStorage.getItem('storagelist');
}

App.once("value", function(snapshot) {
  snapshot.forEach(function(childSnapshot) {
    var key = childSnapshot.key();
    var markup = '<li><a href="#">'+ key + '</a></li>';   
    $('#lists').append(markup); 

    $("#lists li").click(function () {
        storagelistname = $(this).text();
        localStorage.setItem('storagelist', storagelistname);
        location.reload();
    }); 
  });
});


var List = new Firebase(appPath + appName +'/'+ listName +'/List');
var Done = new Firebase(appPath + appName +'/'+ listName +'/Done');
var Tags = new Firebase(appPath + appName +'/Tags/List');


$(".not-done h1").text(listName);


//Listens for data changes
List.on('child_added', function(snapshot) {

        var message = snapshot.val();                   
        createTodo(message.name, snapshot.key());         
        countTodos();
});

List.on('child_removed', function(snapshot) {
        var message = snapshot.val(); 
        var ItemRef = snapshot.key();           
        removeItem(ItemRef);
        countTodos();
});

Done.on('child_added', function(snapshot) {
        var message = snapshot.val();            
        done(message.name, snapshot.key());         
});

Done.on('child_removed', function(snapshot) {
        var message = snapshot.val(); 
        var ItemRef = snapshot.key();           
        removeItem(ItemRef);
});

Tags.on('value', function(snapshot) {        
        setTags();       
});


//control the view with jquery
$("#sortable").sortable({
    update: function(e, ui) {            
            newIndex = ui.item.index();
            console.log(newIndex);            
        }    
});

$("#sortable").disableSelection();

countTodos();

// all done btn
$("#checkAll").click(function(){
    AllDone();
});

//create todo
$('.add-todo').on('keypress',function (e) {
      e.preventDefault
      if (e.which == 13) {
           if($(this).val() != ''){
              var todo = $(this).val();                 
              var index = $('li:last').index()+1;                     
              List.push({name: todo, position: index}); 
              addTag(todo);              
              countTodos();
           } else {
               // some validation
           }
      }
});

$('#save-button').on('click', function () {
  var storagelistname = $('#list-input').val();
  localStorage.setItem('storagelist', storagelistname);
  location.reload();
})

// mark task as done
$('.todolist').on('change','#sortable li input[type="checkbox"]',function(){
    if($(this).prop('checked')){
        var doneItem = $(this).parent().parent().find('label').text();
        var doneItemId = $(this).parent().parent().parent().attr('id');
        var ItemRef = new Firebase(appPath + appName +'/'+ listName +'/List/' + doneItemId);
        ItemRef.remove();
        Done.push({name: doneItem});   
        countTodos();
    }
});

//delete done task from "completed"
$('.todolist').on('click','.remove-item',function(){
    var deleteItemId = $(this).parent().attr('id');  
    var ItemRef = new Firebase(appPath + appName +'/'+ listName +'/Done/' + deleteItemId);
    ItemRef.remove();     
});


//Functions

// count tasks
function countTodos() {
    var count = $("#sortable li").length;
    $('.count-todos').html(count);
}

//create task
function createTodo(text, id) {    
    var markup = '<li id="'+ id +'" class="ui-state-default"><div class="checkbox"><label><input type="checkbox" value="" /><span class="listitem">'+ text +'</span></label></div></li>';   
    $('#sortable').append(markup);      
    $('.add-todo').val('');    
}

//mark task as done
function done(doneItem, id) {
    var done = doneItem;
    var markup = '<li id="'+ id +'">'+ done +'<button class="btn btn-default btn-xs pull-right remove-item"><span class="glyphicon glyphicon-remove"></span></button></li>';
    $('#done-items').append(markup);
}

//mark all tasks as done
function AllDone() {

    $('#sortable li').each( function() {      
         var doneItem = $(this).text(); 
         var doneItemId = $(this).attr('id');
         var ItemRef = new Firebase(appPath + appName +'/'+ listName +'/List/' + doneItemId);
         ItemRef.remove();
         Done.push({name: doneItem}); 
    }); 

    $('#sortable li').remove();
    countTodos();
}

//remove done task from list
function removeItem(element){
    var x=document.getElementById(element);
    $(x).remove();

}

//empty the old local array, get snapshot of Tags object, loop through adding all children to local array
function setTags() {
  availableTags = [];
  Tags.once("value", function(snapshot) {
    // The callback function will get called for each child
    snapshot.forEach(function(childSnapshot) {
      //key will be the unique child name for each      
      var key = childSnapshot.key();
      // childData will be the actual contents of the child
      var childData = childSnapshot.val();
      //name is the property set when pushing to Tags in addTag function
      var tag = childData.name;      
      availableTags.push(tag);      
    });
  });

  //set the autocomplete for input field
  $( "#item-input" ).autocomplete({
        source: availableTags
    });
}

function addTag(tag) {
  //check to see if the tag is already in the local array. If not, push it to firebase then reset local array
  if ($.inArray(tag, availableTags) == -1) {
    Tags.push({name: tag});
    setTags();
 }
}

$.fn.editable.defaults.mode = 'inline';
//$('#listTitle').editable();





