var List = new Firebase('https://flickering-fire-8187.firebaseio.com/Grocery/List');
var Done = new Firebase('https://flickering-fire-8187.firebaseio.com/Grocery/Done');
var Tags = new Firebase('https://flickering-fire-8187.firebaseio.com/Grocery/Tags/');

setTags();

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

Tags.on('child_added', function(snapshot) {
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
// mark task as done
$('.todolist').on('change','#sortable li input[type="checkbox"]',function(){
    if($(this).prop('checked')){
        var doneItem = $(this).parent().parent().find('label').text();
        var doneItemId = $(this).parent().parent().parent().attr('id');
        var ItemRef = new Firebase('https://flickering-fire-8187.firebaseio.com/Grocery/List/'+doneItemId);
        ItemRef.remove();
        Done.push({name: doneItem});        
        $(this).parent().parent().parent().addClass('remove');        
        countTodos();
    }
});

//delete done task from "completed"
$('.todolist').on('click','.remove-item',function(){
    var deleteItemId = $(this).parent().attr('id');  
    var ItemRef = new Firebase('https://flickering-fire-8187.firebaseio.com/Grocery/Done/'+deleteItemId);
    ItemRef.remove();     
});


//Functions

// count tasks
function countTodos(){
    var count = $("#sortable li").length;
    $('.count-todos').html(count);
}

//create task
function createTodo(text, id){    
    var markup = '<li id="'+ id +'" class="ui-state-default"><div class="checkbox"><label><input type="checkbox" value="" />'+ text +'</label></div></li>';   
    $('#sortable').append(markup);      
    $('.add-todo').val('');    
}

//mark task as done
function done(doneItem, id){
    var done = doneItem;
    var markup = '<li id="'+ id +'">'+ done +'<button class="btn btn-default btn-xs pull-right  remove-item"><span class="glyphicon glyphicon-remove"></span></button></li>';
    $('#done-items').append(markup);
    $('.remove').remove();
}

//mark all tasks as done
function AllDone(){
    var myArray = [];

    $('#sortable li').each( function() {
         myArray.push($(this).text());   
    });
    
    // add to done
    for (i = 0; i < myArray.length; i++) {
        $('#done-items').append('<li>' + myArray[i] + '<button class="btn btn-default btn-xs pull-right  remove-item"><span class="glyphicon glyphicon-remove"></span></button></li>');
    }
    
    // myArray
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
