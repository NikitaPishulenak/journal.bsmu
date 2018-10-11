﻿$(function () {
    $("div.average").each(function () {
        var sum = 0, countGrade = 0;
        var elem = $(this).attr('data-idStudent');
        $('div.grade[data-idStudent="' + elem + '"]').each(function () {
            var gr = $(this).text().split("/");
            for (var i = 0; i < gr.length; i++) {
                if (Number(gr[i])) {
                    sum += Number(gr[i]);
                    countGrade++;
                }
            }
        });
        $('div.average[data-idStudent="' + elem + '"]').html(Math.round(10 * (sum / countGrade)) / 10);
    });

    $("div.answer").each(function () {
        var countAnswer = 0;
        var elem = $(this).attr('data-idStudent');
        $('div.grade[data-idStudent="' + elem + '"]').each(function () {
            var gr = $(this).text().split("/");
            if (Number(gr[0])) {
                countAnswer++
            }
        });
        $('div.answer[data-idStudent="' + elem + '"]').html(Math.round(100 * (countAnswer * 100 / $('div.grade[data-idStudent="' + elem + '"]').length)) / 100 + "%");
    });
});


$(function () {
    var dialog, form, edit_dialog, edit_form;
    var myStudentId = new Array();
    var myStudentZapis = new Array();

    function addLesson() {
        checkDate("lesson-date");
        if ($("#lesson-date").val() != "") {
            var dateLesson = $("#lesson-date").val();
            var cnt = $("div.container-list").find("div.fio_student").length;
            var number_theme_lesson=$('input#number_theme').val();
            number_theme_lesson=(number_theme_lesson=="") ? 0 : $('input#number_theme').val();
            $('div.fio_student').each(function (index, element) {
                myStudentId[index] = $(element).attr('data-idStudent');
            });

            if ($("#colloquium_rb").is(':checked')) {
                $.ajax({
                    type: 'get',
                    url: 'z.php',
                    data: {
                        'dateLesson': dateLesson,
                        'PKE': "1",
                        'idGroup': $("input#idGroup").val(),
                        'idLessons': $("input#idSubject").val(),
                        'PL': "0",
                        'numberThemeLesson':number_theme_lesson,
                        'menuactiv': "addLesson",
                        'ajaxTrue':"1"
                    },
                    success: function (st) {
                        if ((st != "No") && (st != "Access is denied!") && (st != "No access rights!")) {
                            dateLesson=(dateLesson.charAt(0)=="0") ? dateLesson.slice(1) : dateLesson;
                            (number_theme_lesson==0) ? $("<div class='date_col colloquium_theme'><div class='date_title' data-idLesson="+st+" data-number_theme_lesson="+number_theme_lesson+">"+ dateLesson + "</div></div>").insertAfter('div.date_col:last') :
                                $("<div class='date_col colloquium_theme'><div class='nLesson'>" +number_theme_lesson+"</div><div class='date_title' data-idLesson="+st+" data-number_theme_lesson="+number_theme_lesson+">"+ dateLesson + "</div></div>").insertAfter('div.date_col:last');

                            for (var i = 0; i < cnt; i++) {
                                $("div.date_col:last").append("<div class='grade' data-idLes=" + st + " data-idStudent=" + myStudentId[i] + " data-PKE=1 data-zapis=0></div>");
                                myStudentZapis[st + 'Zapis' + myStudentId[i]] = 0;
                            }
                            $(".result_box").animate({scrollLeft: '10000px'}, timeScroll);
                        }
                        else {
                            if (st == "No") {
                                alert("Произошел сбой при записи данных!");
                            }
                            else if (st == "Access is denied!") {
                                alert("Извините, время вашей рабочей сессии истекло. Пожалуйста, закройте браузер и заново авторизуйтесь.");
                            }
                            else if (st == "No access rights!") {
                                alert("Не достаточно прав!");
                            }
                            else {
                                alert("Что-то пошло не так! ");
                            }
                        }

                    },
                    error: function () {
                        alert("Произошла ошибка при передаче данных");
                    }
                });
            }
            else if ($("#exam_rb").is(':checked')) {
                $.ajax({
                    type: 'get',
                    url: 'z.php',
                    data: {
                        'dateLesson': dateLesson,
                        'PKE': "2",
                        'idGroup': $("input#idGroup").val(),
                        'idLessons': $("input#idSubject").val(),
                        'PL': "0",
                        'numberThemeLesson':number_theme_lesson,
                        'menuactiv': "addLesson",
                        'ajaxTrue':"1"
                    },
                    success: function (st) {
                        if ((st != "No") && (st != "Access is denied!") && (st != "No access rights!")) {
                            dateLesson=(dateLesson.charAt(0)=="0") ? dateLesson.slice(1) : dateLesson;

                            (number_theme_lesson==0) ? $("<div class='date_col exam_theme'><div class='date_title' data-idLesson="+st+" data-number_theme_lesson="+number_theme_lesson+">"  + dateLesson + "</div></div>").insertAfter('div.date_col:last') :
                                $("<div class='date_col exam_theme'><div class='nLesson'>" +number_theme_lesson+"</div><div class='date_title' data-idLesson="+st+" data-number_theme_lesson="+number_theme_lesson+">"  + dateLesson + "</div></div>").insertAfter('div.date_col:last');

                            for (var i = 0; i < cnt; i++) {
                                $("div.date_col:last").append("<div class='grade' data-idLes=" + st + " data-idStudent=" + myStudentId[i] + " data-PKE=2 data-zapis=0></div>");
                                myStudentZapis[st + 'Zapis' + myStudentId[i]] = 0;
                            }
                            $(".result_box").animate({scrollLeft: '10000px'}, timeScroll);
                        }
                        else {
                            if (st == "No") {
                                alert("Произошел сбой при записи данных!");
                            }
                            else if (st == "Access is denied!") {
                                alert("Извините, время вашей рабочей сессии истекло. Пожалуйста, закройте браузер и заново авторизуйтесь.");
                            }
                            else if (st == "No access rights!") {
                                alert("Не достаточно прав!");
                            }
                            else {
                                alert("Что-то пошло не так! ");
                            }
                        }
                    },
                    error: function () {
                        alert("Произошла ошибка при передаче данных");
                    }
                });
            }
            else {

                $.ajax({
                    type: 'get',
                    url: 'z.php',
                    data: {
                        'dateLesson': dateLesson,
                        'PKE': "0",
                        'idGroup': $("input#idGroup").val(),
                        'idLessons': $("input#idSubject").val(),
                        'PL': "0",
                        'numberThemeLesson':number_theme_lesson,
                        'menuactiv': "addLesson",
                        'ajaxTrue':"1"
                    },
                    success: function (st) {
                        if ((st != "No") && (st != "Access is denied!") && (st != "No access rights!")) {
                            dateLesson=(dateLesson.charAt(0)=="0") ? dateLesson.slice(1) : dateLesson;
                            (number_theme_lesson==0) ? $("<div class='date_col'><div class='date_title' data-idLesson="+st+" data-number_theme_lesson="+number_theme_lesson+">" + dateLesson + "</div></div>").insertAfter('div.date_col:last') :
                                $("<div class='date_col'><div class='nLesson'>" +number_theme_lesson+"</div><div class='date_title' data-idLesson="+st+" data-number_theme_lesson="+number_theme_lesson+">" + dateLesson + "</div></div>").insertAfter('div.date_col:last');

                            for (var i = 0; i < cnt; i++) {
                                $("div.date_col:last").append("<div class='grade' data-idLes=" + st + " data-idStudent=" + myStudentId[i] + " data-PKE=0 data-zapis=0></div>");
                                myStudentZapis[st + 'Zapis' + myStudentId[i]] = 0;
                            }
                            $(".result_box").animate({scrollLeft: '10000px'}, timeScroll);
                        }
                        else {
                            if (st == "No") {
                                alert("Произошел сбой при записи данных!");
                            }
                            else if (st == "Access is denied!") {
                                alert("Извините, время вашей рабочей сессии истекло. Пожалуйста, закройте браузер и заново авторизуйтесь.");
                            }
                            else if (st == "No access rights!") {
                                alert("Не достаточно прав!");
                            }
                            else {
                                alert("Что-то пошло не так! ");
                            }
                        }
                    },
                    error: function () {
                        alert("Произошла ошибка при передаче данных");
                    }
                });
            }
            dialog.dialog("close");
        }
    }

    dialog = $("#form-lesson").dialog({
        resizable: false,
        autoOpen: false,
        modal: true,
        buttons: {
            "Создать": addLesson,
            Отмена: function () {
                $('input#number_theme').blur();
                dialog.dialog("close");
            }
        },
        close: function () {
            form[0].reset();
        }
    });
    form = dialog.find("form").on("submit", function (event) {
        event.preventDefault();
    });

    //Редактирование отметки
    edit_dialog = $("#form-edit").dialog({
        resizable: false,
        autoOpen: false,
        height: 'auto',
        width: 'auto',
        modal: true

    });
    edit_form = edit_dialog.find("form").on("submit", function (event) {
        event.preventDefault();
    });


    $("#close").click(function () {
        edit_dialog.dialog("close");
    });


    $('div').delegate(".grade", "dblclick", function () {
        var curStatus=$(this).attr("data-Status");
        var isGr=isGrade($(this));
        if($(this).attr("data-status")==2){
            $("div#item_grade").html(items_grade[3]);
        }
        else{
            switch ($(this).attr("data-pke")){
                case "2":
                    $("div#item_grade").html(items_grade[2]);
                    break;
                case "1":
                    $("div#item_grade").html(items_grade[1]);
                    break;
                case "0":
                    $("div#item_grade").html(items_grade[0]);
                    break;
            }          
        }
        $("button#edit").removeAttr('disabled');
        $("button#close").removeAttr('disabled');
        dat = $(this).parent().find('div.date_title').html();//Дата столбца
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
        $("button#add_grade_input").removeAttr('disabled');
        $("#inp_0").focus();
        $('#inp_2').slideUp(1);
        $('#inp_1').slideUp(1);
        cur_grade = $(this).text();
        elem = $(this);
        grades = cur_grade.split("/");
        $('input#inp_0').focus();

        
        // switch (curStatus) {
        //     case "0":
        //         for (var i = 0; i < grades.length; i++) {
        //             $("#inp_" + i).removeAttr('disabled');
        //             $("button#add_grade_input").attr('disabled', false);
        //             $("div.panel").find('input#inp_' + i).slideDown(1);
        //             $("div.panel").find('input#inp_' + i).val(grades[i]);
        //             if (absenteeisms_with_cause[1] == grades[i]) 
        //             {
        //                 $("#inp_" + i).attr('disabled', 'disabled');
        //                 $("#inp_" + i).blur();
        //             }
        //         }
        //         break;
        //     case "1":
        //         for (var i = 0; i < grades.length; i++) {
        //             $("#inp_" + i).removeAttr('disabled');
        //             $("button#add_grade_input").attr('disabled', true); //для любителей которые любят видеть что было раньше и сейчас
        //             $("div.panel").find('input#inp_' + i).slideDown(1);
        //             $("div.panel").find('input#inp_' + i).val(grades[i]);
        //             if (absenteeisms_with_cause.indexOf(grades[i]) != -1) 
        //             {
        //                 $("#inp_" + i).attr('disabled', 'disabled');
        //                 $("#inp_" + i).blur();
        //             }
        //         }
        //         break;

        //      case "2":
        //         for (var i = 0; i < grades.length; i++) {
        //             $("#inp_" + i).removeAttr('disabled');
        //             $("button#add_grade_input").attr('disabled', true);
        //             $("div.panel").find('input#inp_' + i).slideDown(1);
        //             $("div.panel").find('input#inp_' + i).val(grades[i]);
        //             if (absenteeisms_with_cause.indexOf(grades[i]) == -1) 
        //             {
        //                 $("#inp_" + i).attr('disabled', 'disabled');
        //                 $("#inp_" + i).blur();
        //             }
        //         }
        //         break;
        // }
        // 
        
                switch (curStatus) {
            case "0":
                var disab=0; 
                for (var i = 0; i < grades.length; i++) {
                    $("#inp_" + i).removeAttr('disabled');
                    $("div.panel").find('input#inp_' + i).slideDown(1);
                    $("div.panel").find('input#inp_' + i).val(grades[i]);
                    if (absenteeisms_with_cause[1] == grades[i]) 
                    {
                        disab=1;
                        $("#inp_" + i).blur();
                    }
                }
                if(disab==1){
                    $("button#add_grade_input").attr('disabled', true);
                    $(".inp_cell").attr('disabled', 'disabled');
                }
            break;

            case "1":
                for (var i = 0; i < grades.length; i++) {
                    $("div.panel").find('input#inp_' + i).slideDown(1);
                    $("div.panel").find('input#inp_' + i).val(grades[i]);
                    $("#inp_" + i).blur();
                }
                $("button#add_grade_input").attr('disabled', true);
                $(".inp_cell").attr('disabled', 'disabled');
                
            break;

            case "2":
                for (var i = 0; i < grades.length; i++) {
                    $("#inp_" + i).removeAttr('disabled');
                    $("div.panel").find('input#inp_' + i).slideDown(1);
                    $("div.panel").find('input#inp_' + i).val(grades[i]);
                    $("#inp_" + i).blur();
                }
                $("button#add_grade_input").attr('disabled', false);
            break;
        }

        $(".inp_cell:text").focus(function () {
            inp_id = $(this).attr('id');

            //При нажатии на кнопку с результатами текст выводится в поле ввода
            $("b.tool, span.tool").click(function () {
                var text = $(this).text();
                $("#" + inp_id+":enabled").val(text);
                $("#" + inp_id).blur();
            });

            // //При нажатии на пропуск с количеством часов текст выводится в поле ввода
            // $("span.tool").click(function () {
            //     var text = $(this).text();
            //     $("#"+inp_id).val(text);
            // });
        });
        var countOpenCell = 0;
        for (j = 0; j < 3; j++) {
            if ($("#inp_" + j).val() != "") {
                countOpenCell++;
            }
        }
        if (countOpenCell == 3) {
            $("button#add_grade_input").attr('disabled', true);
        }

        $(".inp_cell:text").keydown(function (event) {
            if (event.keyCode == 8 || event.keyCode == 46) {   //если это удаление
                $(this).val("");
            }
        });
    });

    $("#edit").click(function () {
        var coding = "";
        var bit1 = $("#inp_0").val();
        var bit2 = $("#inp_1").val();
        var bit3 = $("#inp_2").val();
        if (bit1 != "") {
            bit1 = (bit1 == "") ? "" : bit1;
            bit2 = (bit2 == "") ? "" : "/" + bit2;
            bit3 = (bit3 == "") ? "" : "/" + bit3;
            var cur_res = bit1 + bit2 + bit3;
            coding = Encrypt(cur_res);
            elem.html(lowIndex(cur_res));
            smallText(elem);
            //lowIndex(elem.text());
            if ((cur_grade == "") && (cur_res != "")) {
                $.ajax({
                    type: 'get',
                    url: 'z.php',
                    data: {
                        'dateLes': dat,
                        'nGroup': $("input#nGroup").val(),
                        'idLessons': $("input#idSubject").val(),
                        'idStudent': student_id,
                        'PL': $("input#idPL").val(),
                        'PKE': PKE,
                        'idPrepod': $("input#idPrepod").val(),
                        'idLess': id_Less,
                        'menuactiv': "addLessonStudent",
                        'grades': coding,
                        'idF': $("input#idF").val(),
                        'ajaxTrue':"1"
                    },
                    success: function (st) {
                        if ((st != "Access is denied!") && (st != "No access rights!")) {
                            myStudentZapis[id_Less + 'Zapis' + student_id] = st;
                        } else {
                            if (st == "Access is denied!") {
                                alert("Извините, время вашей рабочей сессии истекло. Пожалуйста, закройте браузер и заново авторизуйтесь.");
                            }
                            else if (st == "No access rights!") {
                                alert("Не достаточно прав!");
                            }
                            else {
                                alert("Что-то пошло не так! ");
                            }

                        }
                    },
                    error: function (x, t) {
                        if (t === 'timeout') {
                            alert("Не удалось получить ответ от сервера");
                            edit_dialog.dialog("close");
                            window.location.reload();

                        } else {
                            alert("Произошла ошибка при передаче данных");
                        }
                    },
                    timeout: 30000
                });
            }

            else {
                if (id_Zapis == 0 && myStudentZapis[id_Less + 'Zapis' + student_id] == 0) {
                    alert("�_�_�_из�_�_�>а �_�_и�+ка п�_и п���_���_а�+�� �_а�_�_�<�:");
                } else {
                    if (id_Zapis == 0) id_Zapis = myStudentZapis[id_Less + 'Zapis' + student_id];
                    $.ajax({
                        type: 'get',
                        url: 'z.php',
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
                            'oldGrades': Encrypt(cur_grade),
                            'ajaxTrue':"1"
                        },
                        success: function (st) {
                            if (st == "Access is denied!") {
                                alert("Извините, время вашей рабочей сессии истекло. Пожалуйста, закройте браузер и заново авторизуйтесь.");
                            }
                            else if (st == "No access rights!") {
                                alert("Не достаточно прав!");
                            }
                        },
                        error: function (x, t) {
                            if (t === 'timeout') {
                                alert("Не удалось получить ответ от сервера");
                                edit_dialog.dialog("close");
                                window.location.reload();

                            }
                            else {
                                alert("Произошла ошибка при передаче данных");
                            }
                        },
                        timeout: 30000
                    });
                }
            }
            $("button#edit").attr('disabled', true);
            $("button#close").attr('disabled', true);
            edit_dialog.dialog("close");
            ShowLogTools(); //Дорисовать треугольники и крестики красные
            updateAvg(student_id, "avg_small");
            updateAns(student_id, "ans_small");
            updateAbs(student_id, "abs_small");
        }
        else {
            alert("Для сохранения необходимо ввести хоть одну оценку!");
        }
    });

    $(".inp_cell:text").click(function () {
        $(this).select();
    });

    $("#create_lesson").button().on("click", function () {
        var cr_d = new Date();
        var cr_dStr = cr_d.getDate() + "." + Number(cr_d.getMonth() + 1) + "." + cr_d.getFullYear();
        $('.datepicker').datepicker("setDate", cr_dStr.toString());
        dialog.dialog("open");
    });

    $("#add_grade_input").click(function () {
        var count_cell=$(".inp_cell:visible").length;
        if (count_cell < 3) {
            if ($("#inp_" + (count_cell-1)).val() != "") {
                $("#inp_" + count_cell).slideDown(1);
                $("#inp_" + count_cell).focus();
            }
            else {
                alert("Заполните, пожалуйста, доступное поле ввода оценки!");
            }
        }
        else {
            alert("Допускается не более 3 полей ввода!");
            $("button#add_grade_input").attr('disabled', true);
        }
    });

});


$(document).ready(function () {
    groupNumber = "";
    subject = "";
    teacher = "";
    dateLesson = $("div.date_title:last").val();
    idLesson = "";
    $.getScript('scripts/deleteGrade.js', function(){});

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


    if (is_touch_device()) {
        $.getScript('scripts/mobile/mscriptZav.js', function(){});
    }
});


//Функция по вызову последующих функций редактирования даты занятия
$(function () {
    var edit_date_dialog, edit_date_form;

    edit_date_dialog = $("#form-edit-date").dialog({
        resizable: false,
        autoOpen: false,
        modal: true,
        buttons: {
            "Изменить": editDate,
            "Отмена": function () {
                edit_date_dialog.dialog("close");
            }
        },
        close: function () {
            edit_date_form[0].reset();
        }
    });
    edit_date_form = edit_date_dialog.find("form").on("submit", function (event) {
        event.preventDefault();
    });


    function editDate() {
        checkDate("edit-lesson-date");
        dat = (dat.length == 9) ? "0" + dat : dat;
        if ($("#edit-lesson-date").val() != "") {
            var new_date = $("#edit-lesson-date").val();// дата после изменения
            var newPKE = $("input.edit_type_lesson:checked").val();
            var new_number_theme_lesson=$('input#edit_number_theme').val();
            (new_number_theme_lesson=="") ? new_number_theme_lesson=0 : new_number_theme_lesson;

            if ((dat != new_date) || (newPKE != pke_lesson) || (new_number_theme_lesson!=numb_theme_lesson)) {
                //Замена даты, типа занятия или номера темы занятия
                $.ajax({
                    type: 'get',
                    url: 'z.php',
                    data: {
                        'Date': new_date,
                        'PKE': newPKE,
                        'idGroup': $("input#idGroup").val(),
                        'idLesson': id_Lesson,
                        'numberThemeLesson':new_number_theme_lesson,
                        'menuactiv': "editDate",
                        'ajaxTrue':"1"
                    },
                    success: function (st) {
                        if ((st != "Access is denied!") && (st != "No access rights!")) {
                            dat_col_object.html(new_date);
                            // alert("Дата "+dat+" успешно заменена на "+new_date+"!");
                            window.location.reload();
                        }
                        else {
                            if (st == "Access is denied!") {
                                alert("Извините, время вашей рабочей сессии истекло. Пожалуйста, закройте браузер и заново авторизуйтесь.");
                            }
                            else if (st == "No access rights!") {
                                alert("Не достаточно прав!");
                            }
                            else {
                                alert("Что-то пошло не так! ");
                            }

                        }
                    },
                    error: function () {
                        alert("Произошла ошибка при передаче данных");
                    }
                });

                edit_date_dialog.dialog("close");
            }
            else {
                alert("Для сохранения необходимо изменить дату и/или тип занятия! В ином случае нажмите кнопку 'Отмена'");
            }
        }
    }


    $('div').delegate(".date_title", "dblclick", function () {
        dat = $(this).parent().find('div.date_title').html();//Дата столбца
        // var datemass = dat.split(".");
        // var datepickerDate=datemass[1]+'.'+datemass[0]+'.'+datemass[2];
        dat_col_object = $(this).parent().find('div.date_title');// объект которому принадлежит значение
        pke_lesson = $(this).parent().find("div.grade:first").attr('data-PKE');
        id_Lesson = $(this).attr('data-idLesson');
        numb_theme_lesson=$(this).attr('data-number_theme_lesson');
        edit_date_dialog.dialog("open");
        edit_date_form[0].reset();
        edit_date_dialog.dialog({title: dat});
        $("#edit-lesson-date").val(dat);
        (numb_theme_lesson=="0") ? $('input#edit_number_theme').val("") : $('input#edit_number_theme').val(numb_theme_lesson);
        //$('.datepicker').datepicker("setDate", new Date(datepickerDate) );

        $('.datepicker').datepicker("setDate", dat.toString());
        switch (pke_lesson) {
            case '0':
                $("#edit_simple_lesson_rb").prop("checked", true);
                break;
            case'1':
                $("#edit_colloquium_rb").prop("checked", true);
                break;
            case'2':
                $("#edit_exam_rb").prop("checked", true);
                break;
        }
    });

});

//Функция дешифрирования оценок
$(function () {
    $("div.grade").each(function () {
        if ($(this).text() != "") {
            $(this).html(Decrypt($(this).text()));
        }
    });
});