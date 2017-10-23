/* Isotope (Masonry + Shuffle)
–––––––––––––––––––––––––––––––––––––––––––––––––– */
$(document).ready(() => {


var $grid = $('.grid').masonry({
  // options... 
  columnWidth: '.grid-sizer',
  itemSelector: '.grid-item',
  percentPosition: true

});

$grid.imagesLoaded().progress( function() {
  $grid.masonry('layout');
});

});



