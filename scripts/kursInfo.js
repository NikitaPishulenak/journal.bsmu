$(document).ready(function() {
    var subjDivWidth = $("div.DialogGrKurs").css('width');

    $("div.DialogGrKurs").click(function() {

    	var idGroup=$(this).attr('data-idGroup');
    	var idCaptain=$(this).attr('data-IdCaptain');

        var obj_this_contentGrade = $(this).find(".content_grade");
        obj_this_contentGrade.html("");
        if (obj_this_contentGrade.is(':hidden')) { //блок закрыт и ранее не открывался

            if ($(".content_grade").is(':visible')) {
                $(".content_grade").not(obj_this_contentGrade).hide();
                $(".fullTextClose").not($(this)).css('display', 'none');
                $(".DialogGrKurs").animate({ width: subjDivWidth }, 400);
            }
            obj_this_contentGrade.show();
            $(this).animate({ width: "95%" }, 400, function() {
            	obj_this_contentGrade.html("Здесь могла быть ваша реклама!");
                
            	$.ajax({
            		type: 'get',
            		url: 'd.php',
            		data: {
            			'menuactiv': "editGroupInfo",
            			'idGroup': idGroup,
            			'idCaptain': idCaptain,
            			'ajaxTrue':"1"
            		},
            		beforeSend:function () {
            			obj_this_contentGrade.html("Загрузка...");
            		},
            		success: function (response) {
            			obj_this_contentGrade.html(response);
                            // $(function () {
                            //     obj_this_contentGrade.find('div.Otmetka').each(function () {
                            //         $(this).html(Decrypt($(this).html(), language));
                            //         let isNn=$(this).attr('data-Nn');
                            //         if (isNn==1) {$(this).parent().append("<div class='bullDec'>&bull;</div>")};

                            //         smallText($(this));
                            //         var nLesObj=$(this).prev().find('.nLesson');
                            //         (nLesObj.text()=="0") ? nLesObj.hide() : "";
                            //     });

                            // });
                    },
                    error: function () {
                        alert("Произошла ошибка при передаче данных!");
                    }
                });
                
                $(this).find(".fullTextClose").css('display', 'block');
                $('div').delegate(".fullTextClose", "click", function(event) {
                    event.stopPropagation();
                    event.preventDefault();
                    $(this).parent().find(".content_grade").hide();
                    $(this).hide();
                    $(this).parent().animate({ width: subjDivWidth }, 400);
                });
            });
        }
    });

    $("div.content_grade").click(function(event) {
        event.stopPropagation();
        event.preventDefault();
        return false;
    });
});