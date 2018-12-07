//Функция выделения серым цветом поля, где есть Н без причины
$(function () {
    $("div.grade").each(function () {
        if ($(this).text() != "") {
            $(this).html(Decrypt($(this).text()));
        }
    });
});

//Функция вычисления статистики
$(function () {
        $("div.statistic").append("<div class='date_col_stat_small'><div class='title_small'>Ср.</div><div class='average_small'></div></div><div class='date_col_stat_small'><div class='title_small'>%</div><div class='answer_small'></div></div><div class='date_col_stat_small'><div class='title_small'>Н(ув)</div><div class='absenteesm_small'></div></div>");
        var count=$("div.fio_student").length;
        for(var i=0; i<count; i++){
            data_idS=$(".grade:eq("+i+")").attr('data-idStudent');
            $("div .average_small:last").append("<div class='avg_small' data-idStudent='"+data_idS+"'></div>");
            $("div .answer_small:last").append("<div class='ans_small' data-idStudent='"+data_idS+"'></div>");
            $("div .absenteesm_small:last").append("<div class='abs_small' data-idStudent='"+data_idS+"'></div>");
        }
        $("div .average_small:last").append("<div class='avg_small result_div_small' id='avg_avrige'></div>");
        resize();

        $("div.avg_small").each(function () {
            var elem = $(this).attr('data-idStudent');
            updateAvg(elem, "avg_small");
            updateAns(elem, "ans_small");
            updateAbs(elem, "abs_small");
        });
    });




$(function () {
    var form, edit_dialog, edit_form, log_dialog, log_form, confirm_make_pay, confirm_make_form;
    var myStudentZapis = new Array();

    //Форма выставления оценок
    edit_dialog = $("#form-edit").dialog({
        resizable: false,
        autoOpen: false,
        height: 'auto',
        width: 300,
        modal: true
    });
    edit_form = edit_dialog.find("form").on("submit", function (event) {
        event.preventDefault();
    });

    //Форма подтверждения оплаты
confirm_make_pay = $("#form-make-pay").dialog({
    resizable: false,
    autoOpen: false,
    height: 'auto',
    width: 240,
    modal: true,
    buttons: {
        "Да": function() {
            $.ajax({
                type: 'get',
                url: 'd.php',
                data: {
                    'id_Zapis': elem.attr('data-zapis'),
                    'menuactiv': "makePaid",
                    'ajaxTrue': "1"
                },
                success: function(st) {
                    if (st == "Access is denied!") {
                        alert("Извините, время вашей рабочей сессии истекло. Пожалуйста, закройте браузер и заново авторизуйтесь.");
                    } else if (st == "No access rights!") {
                        alert("Не достаточно прав!");
                    } else {
                        location.reload();
                    }
                },
                error: function() {
                    alert("Произошла ошибка при передаче данных");
                }
            });

            confirm_make_pay.dialog("close");
        },
        "Отмена": function() {
            confirm_make_pay.dialog("close");
        }
    }
});

confirm_make_form = confirm_make_pay.find("form").on("submit", function(event) {
    event.preventDefault();
});

    $('div').delegate(".grade", "dblclick", function (e) {
        var curStatus=$(this).attr("data-Status");
        $("button#edit").removeAttr('disabled');
        $("button#close").removeAttr('disabled');
        elem=0;
        elem = $(this);

        if (elem.text() != "") {
            var c_res = elem.text().split("/");
            for (var i = 0; i < c_res.length; i++) {
                if((e.altKey) && (curStatus==0) && (absenteeisms_with_cause[1]==c_res[i])){
                    confirm_make_pay.dialog("open");
                }
                else if ((absenteeisms.indexOf(c_res[i]) != -1) || (absenteeisms_with_cause.indexOf(c_res[i]) != -1)) {
                    dat = $(this).parent().find('div.date_title').html();
                    student_id = $(this).attr('data-idStudent');
                    id_Less = $(this).attr('data-idLes');
                    PKE = $(this).attr('data-PKE');
                    id_Zapis = $(this).attr('data-zapis');

                    edit_dialog.dialog("open");
                    edit_form[0].reset();

                    var data_studentID = $(this).attr('data-idStudent');
                    var fio_stud = $('div.fio_student[data-idStudent="' + data_studentID + '"]').text();
                    fio_stud=fio_stud.replace(/[\d\.]/g,'').trim();
                    edit_dialog.dialog({title: fio_stud});

                    $("#inp_0").focus().blur();
                    $('#inp_2').slideUp(1);
                    --countCell;
                    $('#inp_1').slideUp(1);
                    --countCell;
                    cur_grade = $(this).text();

                    grades = cur_grade.split("/");
                    $('input#inp_0').focus();
                    
                    switch (curStatus) {
                    case "0":
                        for (var i = 0; i < grades.length; i++) {
                            $("#inp_" + i).removeAttr('disabled');
                            $("div.panel").find('input#inp_' + i).slideDown(1);
                            $("div.panel").find('input#inp_' + i).val(grades[i]);
                            if ((absenteeisms.indexOf($("#inp_" + i).val()) == -1) && (absenteeisms_with_cause.indexOf($("#inp_" + i).val()) == -1)){
                                $("#inp_" + i).attr('disabled', 'disabled');
                                $("#inp_" + i).blur();
                            }
                        }
                    break;

                    case "1":
                        for (var i = 0; i < grades.length; i++) {
                            $("div.panel").find('input#inp_' + i).slideDown(1);
                            $("div.panel").find('input#inp_' + i).val(grades[i]);
                            $("#inp_" + i).blur();
                        }
                        $(".inp_cell").attr('disabled', 'disabled');                      
                    break;

                    case "2":
                        for (var i = 0; i < grades.length; i++) {
                            $("div.panel").find('input#inp_' + i).slideDown(1);
                            $("div.panel").find('input#inp_' + i).val(grades[i]);
                            $("#inp_" + i).blur();
                        }
                        $(".inp_cell").attr('disabled', 'disabled');
                    break;
                }
                    
                    inp_id = -1;
                    $(".inp_cell:text").focus(function () {
                        inp_id = $(this).attr('id');

                        $("b.tool").click(function () {
                            var text = $(this).text();
                            $("#" + inp_id+":enabled").val(text);
                            $("#" + inp_id).blur();
                        });
                    });

//пробно закаментил
                    var countOpenCell = 0, enabled = false;
                    for (var j = 0; j < 3; j++) {
                        //$("#inp_" + j).removeAttr('disabled');
                        if ($("#inp_" + j).val() != "") {
                            countOpenCell++;
                            // if ((absenteeisms.indexOf($("#inp_" + j).val()) == -1) && (absenteeisms_with_cause.indexOf($("#inp_" + j).val()) == -1)) {
                            //     $("#inp_" + j).attr('disabled', 'disabled');
                            // }
                            // else 
                                if (!enabled) {
                                $("#inp_" + j).focus();
                                enabled = true;
                            }
                        }
                    }

                    var absenteeism = /\w/;
                    $(".inp_cell:text").keydown(function (event) {
                        if (event.keyCode == 8 || event.keyCode == 46) {   //если это удаление
                            if (!absenteeism.test(this.value)) {
                                $(this).val("")
                            }
                        }
                    });


                }
            }
        }
    });

    $("#edit").click(function () {
        var coding = "";
        var bit1 = $("#inp_0").val();
        var bit2 = $("#inp_1").val();
        var bit3 = $("#inp_2").val();
        bit1 = (bit1 == "") ? "" : bit1;
        bit2 = (bit2 == "") ? "" : "/" + bit2;
        bit3 = (bit3 == "") ? "" : "/" + bit3;
        var cur_res = bit1 + bit2 + bit3;
        coding = Encrypt(cur_res);
        elem.html(lowIndex(cur_res));
        smallText(elem);

        if (id_Zapis == 0 && myStudentZapis[id_Less + 'Zapis' + student_id] == 0) {
            alert("�_�_�_из�_�_�>а �_�_и�+ка п�_и п���_���_а�+�� �_а�_�_�<�:");
        } else {
            if (id_Zapis == 0) id_Zapis = myStudentZapis[id_Less + 'Zapis' + student_id];
            if(Encrypt(cur_grade)!=coding){
                $.ajax({
                type: 'get',
                url: 'd.php',
                data: {
                    'id_Zapis': id_Zapis,
                    'nGroup': $("input#nGroup").val(),
                    'idF': $("input#idF").val(),
                    'idLessons': $("input#idSubject").val(),
                    'dateLes': dat,
                    'idStudent': student_id,
                    'idPrepod': $("input#idPrepod").val(),
                    'menuactiv': "editLessonStudent",
                    'grades': coding,
                    'ajaxTrue': "1"
                },
                success: function (st) {
                    if (st == "Access is denied!") {
                        alert("Извините, время вашей рабочей сессии истекло. Пожалуйста, закройте браузер и заново авторизуйтесь.");
                    }
                    else if (st == "No access rights!") {
                        alert("Не достаточно прав!");
                    }
                },
                error: function () {
                    alert("Произошла ошибка при передаче данных");
                }
            });
            }
            
        }

        inp_id = 2;

        $("button#edit").attr('disabled', true);
        $("button#close").attr('disabled', true);
        edit_dialog.dialog("close");
        ShowLogTools();
        updateAbs(student_id, "abs_small");
        illuminationAbs(elem);
    });

    $("#close").click(function () {
        edit_dialog.dialog("close");
    });

    $(".inp_cell:text").click(function () {
        $(this).select();
    });

});


$(document).ready(function () {

    countCell = 1;
    groupNumber = "";
    subject = "";
    teacher = "";
    dateLesson = $("div.date_title:last").val();
    idLesson = "";

    $('div.grade').each(function () {
        var thisEl=$(this);
        illuminationAbs(thisEl);
    });

    if (is_touch_device()) {
        $.getScript('scripts/mobile/mscriptDec.js', function () {
        });
    }

});
