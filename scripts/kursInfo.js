$(document).ready(function() {
    var clickToIdGroup=$("#idGrgr").val();
    var objLastGroup="";
    var idGroup="";
    var nGroup="";
    var idCaptain="";
    var idStudent=0;
    
    
    var subjDivWidth = $("div.DialogGrKurs").css('width');
    var dialogRep, formRep;
    

    dialogRep = $("#diapasonRep").dialog({
        resizable: false,
        autoOpen: false,
        modal: true,
        width: 'auto',
        buttons: {
            "Заменить": diapasonRep,
            Отмена: function () {
                dialogRep.dialog("close");
            }
        },
        close: function () {
            formRep[0].reset();
        }
    });
    formRep = dialogRep.find("form").on("submit", function (event) {
        event.preventDefault();
    });

    $(function(){
        if(typeof clickToIdGroup != "undefined"){
            $('.DialogGrKurs[data-idGroup="' + clickToIdGroup + '"]').click();
        }
    });

    

    $("div.DialogGrKurs").click(function() {
        objLastGroup=$(this).find(".content_grade");
        // getStudentList(objLastGroup);

        idGroup=$(this).attr('data-idGroup');
        nGroup=$(this).attr('data-nGroup');
        idCaptain=$(this).attr('data-IdCaptain');
        idStudent=0;


        var obj_this_contentGrade = $(this).find(".content_grade");
        if (obj_this_contentGrade.is(':hidden')) { //блок закрыт и ранее не открывался
            obj_this_contentGrade.html("");
            if ($(".content_grade").is(':visible')) {
                $(".content_grade").not(obj_this_contentGrade).hide();
                $(".fullTextClose").not($(this)).css('display', 'none');
                $(".DialogGrKurs").animate({ width: subjDivWidth }, 400);
            }
            
            $(this).animate({ width: "95%" }, 400, function() {
                obj_this_contentGrade.show();
                
                getStudentList(idGroup, nGroup, idCaptain, obj_this_contentGrade);
                
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

    // $("div.content_grade").click(function(event) {
    //     event.stopPropagation();
    //     event.preventDefault();
    //     return false;
    // });

    $('div').delegate(".DialogKursDiapason", "click", function(event) {
        event.stopPropagation();
        event.preventDefault();
        var fioStudent=$(this).parent().find('.DialogKursName').text().replace(/[\d\.]/g,'').trim();
        idStudent=$(this).attr('data-idStudent');
        dialogRep.dialog("open");
        dialogRep.dialog({title: fioStudent});
        $('#from_date').datepicker("setDate", getCurrentDate());
        $('#to_date').datepicker("setDate", getCurrentDate());
        $('#from_date').datepicker("hide");
        $('#from_date').datepicker("show");
     });

    $("b.tool").click(function () {
        var text = $(this).text();
        $("#inp_0").val(text);
    });

    $(".inp_cell:text").keydown(function (event) {
        if (event.keyCode == 8 || event.keyCode == 46) {   //если это удаление
            $(this).val("");
        }
    });

    function diapasonRep(){

        var from_date=$("#from_date").val();
        var to_date=$("#to_date").val();
        var repGrade=$("#inp_0").val();
        var codingRepGrade=Encrypt($("#inp_0").val());

        if(checkField(repGrade, from_date, to_date)){
            $.ajax({
                    type: 'get',
                    url: 'd.php',
                    data: {
                        'menuactiv': "editGroupReplace",
                        'idStudent': idStudent,
                        'fromDate': from_date,
                        'toDate': to_date,
                        'repGrade': codingRepGrade,
                        'ajaxTrue':"1"
                    },
                    success: function (response) {

                        if (response != "No") {
                            alert("Изменения успешно сохранены.");
                            getStudentList(idGroup, nGroup, idCaptain, objLastGroup);
                        }
                        else {
                            alert("Произошел сбой при попытке заменить пропуски.");
                        }
                    },
                    error: function () {
                        alert("Произошла ошибка при передаче данных!");
                    }
                });
            dialogRep.dialog("close");
        }
    }

    function checkField(repGrade, from_date, to_date){
        var firstD = from_date.split('.');
        var secondD = to_date.split('.');
        var firstDate = new Date (firstD[2], (firstD[1]-1), firstD[0]);
        var secondDate = new Date (secondD[2], (secondD[1] - 1 ), secondD[0]);

        if(repGrade==""){
            alert("Вы не выбрали на что необходимо заменить!");
            return false;
        }
        // if((repGrade=="") || (from_date=="") || (to_date=="")){
     //     alert("Все поля формы должны быть заполнены");
     //     return false;
     //    }
        else if(firstDate > secondDate){
            alert("Начальная дата не может быть позже конечной даты!");
            return false;
        }
        
        return true;

    }

    function getStudentList(idGroup, nGroup, idCaptain, obj){
        $.ajax({
            type: 'get',
            url: 'd.php',
            data: {
                'menuactiv': "editGroupInfo",
                'idGroup': idGroup,
                'nGroup': nGroup,
                'idCaptain': idCaptain,
                'ajaxTrue':"1"
            },
            beforeSend:function () {
                obj.html("Загрузка...");
            },
            success: function (response) {
                obj.html(response);
            },
            error: function () {
                alert("Произошла ошибка при передаче данных!");
            }
        });
    }

 });