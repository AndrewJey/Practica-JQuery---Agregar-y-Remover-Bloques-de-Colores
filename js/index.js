$( document ).ready(function() {

  $('#btnAdd').click(function(event){
  	$('#container').append('<section class="verde"></section>');
  });

  $('#btnRemoveB').click(function(event){
  	$('.asul').remove();
  });

 $('article #btnRemoveG').click(function(){
  	$('.verde').remove();
  });

 $('#container').on("click",".verde",function(){
  	 $(this).removeClass('verde');
        $(this).addClass('asul');
        if ($('#container').find('.asul').length > 1)
        {
        	$('.asul').remove();
        }
  });

  $('#container').on("click",".asul",function(){
  	  $(this).removeClass('asul');
        $(this).addClass('verde');
  });
});