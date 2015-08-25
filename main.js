var List = new Firebase('https://flickering-fire-8187.firebaseio.com/Grocery/List');
var Done = new Firebase('https://flickering-fire-8187.firebaseio.com/Grocery/Done');

List.on('child_added', function(snapshot) {
        var message = snapshot.val();             
        createTodo(message.name, snapshot.key()); 
        countTodos();
});

List.on('child_removed', function(snapshot) {
        var message = snapshot.val();               
        done(message.name); 
        var ItemRef = snapshot.key();           
        removeItem(ItemRef);
        countTodos();
});


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
              var name = todo;   
              var index = $('li:last').index()+1;
              List.push({name: name, position: index});          
              countTodos();
           }else{
               // some validation
           }
      }
});
// mark task as done
$('.todolist').on('change','#sortable li input[type="checkbox"]',function(){
    if($(this).prop('checked')){
        var doneItem = $(this).parent().parent().find('label').text();
        var doneItemId = $(this).parent().parent().parent().attr('id')
        var ItemRef = new Firebase('https://flickering-fire-8187.firebaseio.com/Grocery/List/'+doneItemId);
        ItemRef.remove();
        $(this).parent().parent().parent().addClass('remove');        
        countTodos();
    }
});

//delete done task from "already done"
$('.todolist').on('click','.remove-item',function(){
    removeItem(this);
});

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
function done(doneItem){
    var done = doneItem;
    var markup = '<li>'+ done +'<button class="btn btn-default btn-xs pull-right  remove-item"><span class="glyphicon glyphicon-remove"></span></button></li>';
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