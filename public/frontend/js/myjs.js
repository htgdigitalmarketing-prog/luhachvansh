let professions=document.querySelectorAll('.professionContainer .col-lg-2')

for (let i = 0; i < professions.length; i++) {
   j=i+1;
   if(j%6==0|| j>6){
      professions[j].classList.add('morePro')
   }
}


  $(function () {
        $('.genealogy-tree ul').hide();
        $('.genealogy-tree>ul').show();
        $('.genealogy-tree ul.active').show();
        $('.genealogy-tree li').on('click', function (e) {
            var children = $(this).find('> ul');
            if (children.is(":visible")) children.hide('slow').removeClass('active');
            else children.show('slow').addClass('active');
            e.stopPropagation();
        });
    });


