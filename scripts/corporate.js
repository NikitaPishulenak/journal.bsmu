﻿$(document).ready(function () {
    hideHistory();
    path = window.location.pathname.slice(1);
    timeScroll = 2000;
    $.getScript('scripts/csv.js', function () {});
    var countStudents = $("div.fio_student").length;
    (countStudents==0) ? $("div.export").hide() : "";
    ($("div.grade").length<2) ? $("div.statistic").hide() : "";
    $("#form-comment").hide();

    //Дорисовка точек
    $("div.grade").each(function () {
        var isNn=$(this).attr('data-Nn');
        if (isNn==1){
            $(this).append('<div class="bull" title="Занятие ранее было пропущено"><img src="img/bull.png"></div>');
        } 
    });

    if ((path == "p.php") || (path == "z.php")) {
        $(".result_box").animate({scrollLeft: '10000px'}, timeScroll);
        $('div').delegate(".date_title", "mouseover", function () {
            var numbThemeLesson = $(this).attr('data-number_theme_lesson');

            //$(this).attr('title', 'Кликните дважды для редактирования даты');
            if (numbThemeLesson != 0) {
                $(this).attr('title', '№ темы: ' + numbThemeLesson);
            }
            else {
                $(this).attr('title', 'Кликните дважды для редактирования даты');
            }
        });
    }
    else {
        $(".result_box_statistic").animate({scrollLeft: '10000px'}, timeScroll);
    }

    

    //Дорисовать треугольники и крестики красные
    ShowLogTools();

    $('div').delegate(".grade", "mouseover", function (e) {
        data_st = $(this).attr('data-idStudent');
        $('div [data-idStudent="' + data_st + '"]').addClass("illumination");
        showTools($(this));
    });

    $('div').delegate(".Oc", "mouseover", function (e) {
        $(this).find("img.tr").show();
    });

    $('div').delegate(".grade", "mouseout", function () {
        data_st = $(this).attr('data-idStudent');
        $('div [data-idStudent="' + data_st + '"]').removeClass("illumination");
        hideTools($(this));
    });

    $('div').delegate(".Oc", "mouseout", function () {
        $(this).find("img.tr").hide();
    });

    //всплывающие подсказки
    $('div').delegate(".average_small, .avg", "mouseover", function () {
        $(this).attr('title', 'Средний балл');
    });
    $('div').delegate(".ans_small, .ans", "mouseover", function () {
        $(this).attr('title', '% активности студента');
    });
    $('div').delegate(".abs_small", "mouseover", function () {
        $(this).attr('title', 'Пропуски: Всего (Из них уважительных)');
    });

    if (is_touch_device()) {
        $.getScript('scripts/mobile/mcorporate.js', function () {
        });
    }

    //Функция логирования
    $('div').delegate(".triangle-topright", "click", function (e) {
        log_object = $(this).parent();
        if ($("#history").is(":visible")) {
            showTools(log_object);
            log_object.append('<img src="img/tr.png" class="tr">');
        }

        var stud_id = $(this).parent().attr("data-idStudent");
        var zap_id = $(this).parent().attr("data-zapis");

        var remainder = Number($(window).width() - e.pageX);

        $("#history").css("top", Number($(this).offset().top + 11));//11 размер триугольника
        if (remainder > 290) {
            $("#history").css("left", Number($(this).offset().left + 10));
        }
        else {
            $("#history").css("left", Number($(this).offset().left - 280)); //250- ширина окна логов + 10 в резерв
        }

        $.ajax({
            type: 'get',
            url: 'log.php',
            data: {
                'idStudent': stud_id,
                'idZapis': zap_id,
                'ajaxTrue': "1"
            },
            success: function (st, event) {

                if (st == "Access is denied!") {
                    hideHistory();
                    alert("Извините, время вашей рабочей сессии истекло. Пожалуйста, закройте браузер и заново авторизуйтесь.");

                }
                else {
                    $("#log_text").html(st);
                    $("#log_text").find(".gLog").each(function () {
                        var c_g = $(this).html();
                        $(this).html(Decrypt(c_g));
                    });
                }

            },
            error: function () {
                alert("Не удалось просмотреть историю изменений!");
            }
        });


        showHistory();

        $(function () {
            $(document).mouseup(function (e) {
                hideHistory();
                $("img.tr").hide();
                //Если кликаешь по всплывающему окну ничего не пропадет
                // if (!$("#history").is(e.target) && $("#history").has(e.target).length === 0) { // и не по его дочерним элементам
                //     hideHistory();
                // }
            });
        });
    });

    $("div.SumStat").click(function(){
        var pathURL=location.pathname.slice(1);
        var winH=document.documentElement.clientHeight*0.8;

        var show_dialog, show_form;
        //Окно просмотра
        show_dialog = $("#form-show").dialog({
            resizable: false,
            autoOpen: false,
            height: winH,
            width: '90%',
            modal: true
        });
        show_form = show_dialog.find("form").on("submit", function (event) {
            event.preventDefault();
        });
        
        var fio=$(this).parent().text().replace(/[\d\.]/g,'').trim();


        $.ajax({
            type: 'get',
            url: pathURL,
            data: {
                'idStudent': $(this).parent().attr("data-idStudent"),
                'nGroup': $("input#nGroup").val(),
                'idSubject': $("input#idSubject").val(),
                'idPL': $("input#idPL").val(),
                'menuactiv': "OldPizdabol",
                'ajaxTrue': "1"
            },
            beforeSend:function () {
                $("div#content").html("Загрузка..."); 
            },
            success: function (response) {
                if ((response != "No") && (response != "Access is denied!") && (response != "No access rights!")) {
                    show_dialog.dialog("open"); 
                    $("#sub").html($("input#nSubject").val());
                    $("#fio").html(fio);
                    $("div#content").html(response); 

                    $('div.Otmetka').each(function(){
                        $(this).html(Decrypt($(this).text()));
                        $(this).parent().css("opacity", "1");
                        var isNn=$(this).attr('data-Nn');
                        if (isNn==1){
                            $(this).append('<div class="bullDec"><img src="img/bull.png"></div>');
                        } 
                    }); 
                    
                    $("body").click(function(e){
                        var block=$("#form-show");
                        if (!block.is(e.target) && block.has(e.target).length === 0){
                            show_dialog.dialog("close"); 
                        }
                    });  

                    $('.ui-dialog-titlebar').click(function(e){e.stopPropagation();});         
                }
                else {
                    if (st == "No") {
                        alert("Произошел сбой при получении данных!");
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
                //show_dialog.dialog("open");
                alert("Не удалось получить историю учебы в прежней группе!");
            }
        });
    });
    

    $("#comment").click(function(){
        var pathURL=location.pathname.slice(1);
        var winH=document.documentElement.clientHeight*0.8;

        var comment_dialog, comment_form;
        //Окно просмотра
        comment_dialog = $("#form-comment").dialog({
            resizable: false,
            autoOpen: false,
            height: winH,
            width: '90%',
            modal: true
        });
        comment_form = comment_dialog.find("form").on("submit", function (event) {
            event.preventDefault();
        });
        
        var groupNumber=$("#nGroup").val();
        console.log(pathURL+"-"+groupNumber);

        comment_dialog.dialog("open");
        comment_dialog.dialog({title: "Гр. № "+groupNumber});



        // $.ajax({
        //     type: 'get',
        //     url: pathURL,
        //     data: {
        //         'idStudent': $(this).parent().attr("data-idStudent"),
        //         'nGroup': $("input#nGroup").val(),
        //         'idSubject': $("input#idSubject").val(),
        //         'idPL': $("input#idPL").val(),
        //         'menuactiv': "OldPizdabol",
        //         'ajaxTrue': "1"
        //     },
        //     beforeSend:function () {
        //         $("div#content").html("Загрузка..."); 
        //     },
        //     success: function (response) {
        //         if ((response != "No") && (response != "Access is denied!") && (response != "No access rights!")) {
        //             show_dialog.dialog("open"); 
        //             $("#sub").html($("input#nSubject").val());
        //             $("#fio").html(fio);
        //             $("div#content").html(response); 

        //             $('div.Otmetka').each(function(){
        //                 $(this).html(Decrypt($(this).text()));
        //                 $(this).parent().css("opacity", "1");
        //                 var isNn=$(this).attr('data-Nn');
        //                 if (isNn==1){
        //                     $(this).append('<div class="bullDec"><img src="img/bull.png"></div>');
        //                 } 
        //             }); 
                    
        //             $("body").click(function(e){
        //                 var block=$("#form-show");
        //                 if (!block.is(e.target) && block.has(e.target).length === 0){
        //                     show_dialog.dialog("close"); 
        //                 }
        //             });  

        //             $('.ui-dialog-titlebar').click(function(e){e.stopPropagation();});         
        //         }
        //         else {
        //             if (st == "No") {
        //                 alert("Произошел сбой при получении данных!");
        //             }
        //             else if (st == "Access is denied!") {
        //                 alert("Извините, время вашей рабочей сессии истекло. Пожалуйста, закройте браузер и заново авторизуйтесь.");
        //             }
        //             else if (st == "No access rights!") {
        //                 alert("Не достаточно прав!");
        //             }
        //             else {
        //                 alert("Что-то пошло не так! ");
        //             }
        //         }        
        //     },
        //     error: function () {
        //         //show_dialog.dialog("open");
        //         alert("Не удалось получить историю учебы в прежней группе!");
        //     }
        // });
    });
});

$(window).resize(function () {
    resize();
});


//Календарь
$(function () {
    $.datepicker.regional['ru'] = {
        monthNames: ['Январь', 'Февраль', 'Март', 'Апрель',
            'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь',
            'Октябрь', 'Ноябрь', 'Декабрь'],
        dayNamesMin: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
        maxDate: 0,
        autoOpen: false
    };
    $('.datepicker').datepicker({dateFormat: 'dd.mm.yy', firstDay: 1});
    $.datepicker.setDefaults($.datepicker.regional['ru']);
    $('.datepicker').mask("99.99.9999");
    $.datepicker.setDefaults({showAnim: 'show'});
});

//Горизонтальная прокрутка при кручении колесом
// Функция для добавления обработчика событий
function addHandler(object, event, handler) {
    if (object.addEventListener) {
        object.addEventListener(event, handler, false);
    }
    else if (object.attachEvent) {
        object.attachEvent('on' + event, handler);
    }
    else alert("Обработчик не поддерживается");
}

addHandler(window, 'DOMMouseScroll', wheel);
addHandler(window, 'mousewheel', wheel);
addHandler(document, 'mousewheel', wheel);

function wheel(event) {
    var target = $(event.target);
    if (target.is("div.grade")) {
        var curLeft = $(".result_box_statistic").scrollLeft();
        var curLeft1 = $(".result_box").scrollLeft();
        var delta; // Направление колёсика мыши
        event = event || window.event;
        // Opera и IE работают со свойством wheelDelta
        if (event.wheelDelta) { // В Opera и IE
            delta = event.wheelDelta / 120;
            // В Опере значение wheelDelta такое же, но с противоположным знаком
            if (window.opera) delta = -delta; // Дополнительно для Opera
        }
        else if (event.detail) { // Для Gecko
            delta = -event.detail / 3;
        }
        // Запрещаем обработку события браузером по умолчанию
        if (event.preventDefault) event.preventDefault();
        event.returnValue = false;
        //alert(delta); // Выводим направление колёсика мыши
        if (delta == 1) {
            $(".result_box_statistic").scrollLeft(curLeft + 50);
            $(".result_box").scrollLeft(curLeft1 + 50);
        }
        else if (delta == -1) {
            $(".result_box_statistic").scrollLeft(curLeft - 50);
            $(".result_box").scrollLeft(curLeft1 - 50);
        }

    }
}


$(function (event) {
    if (event.keyCode == 38 || event.keyCode == 40) {
        return false;
    }
});

absenteeisms = new Array("Н1", "Н2", "Н3", "Н4", "Н5", "Н6", "Н7", "Н1.5", "Н2.5", "Н3.5", "Н4.5", "Н5.5", "Н6.5", "Н");
absenteeisms_with_cause = new Array("Ну", "Нн", "Нб.о");
other_symbols = new Array("Отр");
grades = new Array("1", "2", "3", "4", "5", "6", "7", "8", "9", "10");

//массив с первой строчкой кнопок (при выставлении оценок для роли препод и зав каф)
items_grade = [
    [//simple_lesson
        "<b id='1' class='tool absenteeism_closed' title='Занятие отработано.'><b>Отр</b></b><span class='space'></span>",

        "<hr class='marg-line'>",

        "<span id='2' class='tool absent' title='Пропуск занятия 1 час.'><span>Н<sub>1</sub></span></span><span class='space'></span>",
        "<span id='3' class='tool absent' title='Пропуск занятия 2 часа.'><span>Н<sub>2</sub></span></span><span class='space'></span>",
        "<span id='4' class='tool absent' title='Пропуск занятия 3 часа.'><span>Н<sub>3</sub></span></span><span class='space'></span>",
        "<span id='5' class='tool absent' title='Пропуск занятия 4 часа.'><span>Н<sub>4</sub></span></span><span class='space'></span>",
        "<span id='6' class='tool absent' title='Пропуск занятия 5 часов.'><span>Н<sub>5</sub></span></span><span class='space'></span>",
        "<span id='7' class='tool absent' title='Пропуск занятия 6 часов.'><span>Н<sub>6</sub></span></span><span class='space'></span>",
        "<span id='8' class='tool absent' title='Пропуск занятия 7 часов.'><span>Н<sub>7</sub></span></span>",
        "<br><span class='space'></span><span class='space'></span><span class='space'></span>",
        "<span id='9' class='tool absent' title='Пропуск занятия 1.5 часа.'><span>Н<sub>1.5</sub></span></span><span class='space'></span>",
        "<span id='10' class='tool absent' title='Пропуск занятия 2.5 часа.'><span>Н<sub>2.5</sub></span></span><span class='space'></span>",
        "<span id='11' class='tool absent' title='Пропуск занятия 3.5 часа.'><span>Н<sub>3.5</sub></span></span><span class='space'></span>",
        "<span id='12' class='tool absent' title='Пропуск занятия 4.5 часа.'><span>Н<sub>4.5</sub></span></span><span class='space'></span>",
        "<span id='13' class='tool absent' title='Пропуск занятия 5.5 часов.'><span>Н<sub>5.5</sub></span></span><span class='space'></span>",
        "<span id='14' class='tool absent' title='Пропуск занятия 6.5 часов.'><span>Н<sub>6.5</sub></span></span><span class='space'></span>"
    ],
    [//colloquium
        "<b id='1' class='tool absenteeism_closed' title='Занятие отработано.'><b>Отр</b></b><span class='space'></span>",
        "<b id='2' class='tool fail' title='Недопуск к аттестации.'><b>Недоп</b></b></span><span class='space'></span>",

        "<hr class='marg-line'>",

        "<span id='3' class='tool' title='Пропуск занятия 1 час.'><span>Н<sub>1</sub></span></span><span class='space'></span>",
        "<span id='4' class='tool' title='Пропуск занятия 2 часа.'><span>Н<sub>2</sub></span></span><span class='space'></span>",
        "<span id='5' class='tool' title='Пропуск занятия 3 часа.'><span>Н<sub>3</sub></span></span><span class='space'></span>",
        "<span id='6' class='tool' title='Пропуск занятия 4 часа.'><span>Н<sub>4</sub></span></span><span class='space'></span>",
        "<span id='7' class='tool' title='Пропуск занятия 5 часов.'><span>Н<sub>5</sub></span></span><span class='space'></span>",
        "<span id='8' class='tool' title='Пропуск занятия 6 часов.'><span>Н<sub>6</sub></span></span><span class='space'></span>",
        "<span id='9' class='tool' title='Пропуск занятия 7 часов.'><span>Н<sub>7</sub></span></span>"
    ],
    [//exam
        "<b id='1' class='tool' title='Допуск к аттестации'><b>Доп</b></b><span class='space'></span>",
        "<b id='2' class='tool fail' title='Недопуск к аттестации.'><b>Недоп</b></b><span class='space'></span>",
        "<b id='3' class='tool' title='Пропуск занятия целиком.'><b>Н</b></b><span class='space'></span>",
        "<b id='4' class='tool' title='Зачтено.'><b>Зач</b></b><span class='space'></span></span><span class='space'></span>",
        "<b id='5' class='tool' title='Не зачтено.'><b>Незач</b></b><span class='space'></span>"
    ],
    [//completed_pay
        "<b id='1' class='tool absenteeism_closed' title='Занятие отработано.'><b>Отр</b></b><span class='space'></span>",
    ],
        [//лекция
        "<b id='1' class='tool' title='Пропуск занятия целиком.'><b>Н</b></b><span class='space'></span>",
        "<b id='11' class='tool absenteeism_closed' title='Занятие отработано.'><b>Отр</b></b>"
    ],
        [//оплаченная лекция
        "<b id='11' class='tool absenteeism_closed' title='Занятие отработано.'><b>Отр</b></b>"
    ],
];


//функция проверки введенных данных в поле оценка
function proverka(event, id) {

    var not_digital = /\D/;
    var str_id = 'inp_' + id;
    var el = document.getElementById(str_id);

    if ((event.keyCode == 8) || (event.keyCode == 27)) {
        return;
    }
    if (((event.keyCode >= 48) && (event.keyCode <= 57)) || ((event.keyCode >= 96) && (event.keyCode <= 105))) {

        $(function () {

            if ((el.value > 10) || (el.value < 1)) {
                el.value = "";
            }
        });
    }

    else if ((el.value > 10) || (el.value < 1)) {
        el.value = "";
        return false;
    }
    else {
        return false;
    }
}


//Функция проверки правильности ввода номера темы занятия
function checkNumberThemeLesson(event) {
    if ((event.keyCode == 8) || (event.keyCode == 27) || (event.keyCode == 46)) {
        return;
    }
    else if (((event.keyCode >= 48) && (event.keyCode <= 57)) || ((event.keyCode >= 96) && (event.keyCode <= 105))) {
        return true;
    }
    else {
        return false;
    }
}

//Функция по проверке дату на корректность. Запрещено выбирать дату будущего
function checkDate(id_field) {
    if ($("#" + id_field).val() == "") {
        alert("Заполните поле 'Дата'.");
        return false;
    }
    if ($("#" + id_field).val().length == 10) {
        var arrD = $("#" + id_field).val().split(".");
        arrD[1] -= 1;
        var d = new Date(arrD[2], arrD[1], arrD[0]);//0-день 1-месяц 2-год
        if ((d.getFullYear() == arrD[2]) && (d.getMonth() == arrD[1]) && (d.getDate() == arrD[0])) {
            if (arrD[2] < 2017) {
                alert("Скорее всего Вы ошиблись с годом! Проверьте правильность даты.");
                $("#lesson-date").val('');
                return false;
            }

            var newDate = new Date();
            var now = newDate.getDate() + "." + (newDate.getMonth() + 1) + "." + newDate.getFullYear();

            if ((arrD[2] > newDate.getFullYear()) || ((arrD[2] >= newDate.getFullYear()) && (arrD[1] > newDate.getMonth()))
                || ((arrD[2] >= newDate.getFullYear()) && (arrD[1] >= newDate.getMonth()) && arrD[0] > newDate.getDate())) {
                alert("Введенная Вами дата '" + $("#" + id_field).val() + "' еще не наступила!");
                $("#" + id_field).val('');
                return false;
            }
        }
        else {
            alert("Введена некорректная дата! " + $("#" + id_field).val());
            $("#" + id_field).val('');
            return false;
        }

    }
    else {
        alert("Дата должна быть введена в формате: дд.мм.гггг");
        $("#" + id_field).val('');
        return false;
    }
}


//Функция шифрования расшифрования оценок
function Encrypt(value) {
    var res = "";
    var grade = value.split("/");
    for (i = 0; i < grade.length; i++) {
        res += MatchEncrypt(grade[i]);
    }
    return res;
}

function Decrypt(value) {
    var res = "";
    var mas = value.match(/.{2}/g);
    for (i = 0; i < mas.length; i++) {
        mas[i] = MatchDecrypt(mas[i]);
    }
    res = mas.join('/');
    // alert(res);
    return res;
}


function MatchEncrypt(val) {

    if (val >= 1 && val <= 10) {
        return Number(val) + 9;
    }
    else {
        switch (val) {
            case 'Ну':
                return '20';
                break;
            case 'Нн':
                return '21';
                break;
            case 'Нб.о':
                return '22';
                break;
            case 'Зач':
                return '23';
                break;
            case 'Незач':
                return '24';
                break;
            case 'Недоп':
                return '25';
                break;
            case 'Н':
                return '26';
                break;
            case 'Отр':
                return '27';
                break;
            case 'Доп':
                return '28';
                break;

            case 'Н1':
                return '31';
                break;
            case 'Н2':
                return '32';
                break;
            case 'Н3':
                return '33';
                break;
            case 'Н4':
                return '34';
                break;
            case 'Н5':
                return '35';
                break;
            case 'Н6':
                return '36';
                break;
            case 'Н7':
                return '37';
                break;

            case 'Н1.5':
                return '40';
                break;
            case 'Н2.5':
                return '41';
                break;
            case 'Н3.5':
                return '42';
                break;
            case 'Н4.5':
                return '43';
                break;
            case 'Н5.5':
                return '44';
                break;
            case 'Н6.5':
                return '45';
                break;

        }
    }

}

function MatchDecrypt(val) {
    if (val >= 10 && val < 20) {
        return Number(val) - 9;
    }
    else {
        switch (val) {
            case '20':
                return "Н<sub>у</sub>";
                break;
            case '21':
                return "Н<sub>н</sub>";
                break;
            case '22':
                return "Н<sub>б.о</sub>";
                break;
            case '23':
                return "Зач";
                break;
            case '24':
                return "Незач";
                break;
            case '25':
                return "Недоп";
                break;
            case '26':
                return "Н";
                break;
            case '27':
                return "Отр";
                break;
            case '28':
                return "Доп";
                break;

            case '31':
                return "Н<sub>1</sub>";
                break;
            case '32':
                return "Н<sub>2</sub>";
                break;
            case '33':
                return "Н<sub>3</sub>";
                break;
            case '34':
                return "Н<sub>4</sub>";
                break;
            case '35':
                return "Н<sub>5</sub>";
                break;
            case '36':
                return "Н<sub>6</sub>";
                break;
            case '37':
                return "Н<sub>7</sub>";
                break;

            case '40':
                return "Н<sub>1.5</sub>";
                break;
            case '41':
                return "Н<sub>2.5</sub>";
                break;
            case '42':
                return "Н<sub>3.5</sub>";
                break;
            case '43':
                return "Н<sub>4.5</sub>";
                break;
            case '44':
                return "Н<sub>5.5</sub>";
                break;
            case '45':
                return "Н<sub>6.5</sub>";
                break;
        }
    }

}

//Функция по обработке горячих клавиш и Enter
document.addEventListener('keydown', function (e) {
    var val = parseInt(e.key);
    val = (!isNaN(val)) ? val : false;
    if (val !== false) {
        if (e.altKey) {
            $("#" + id_input).val($("#panel>#" + val).text());
            $("#" + id_input).blur();
        }
    }

    if (e.keyCode == 13) {
        if ($("#form-edit").dialog("isOpen")) {
            if ($("#edit").prop("disabled")) {
                return false;
            }
            else {
                $("#edit").click();
            }
        }
    }
}, false);


//При выставление фокуса input в переменную получает id inputa
$(function () {
    $("input.inp_cell").focus(function () {
        id_input = $(this).attr('id');
    });
});

$(function () {
    $('b.tool, span.tool, div.grade, div.date_title, input.inp_cell').mousedown(function (event) {
        event.stopPropagation();
        event.preventDefault();
        return false;
    });
});

$(function () {
    $('div.triangle-topright').dblclick(function (event) {
        event.stopPropagation();
        event.preventDefault();
        return false;
    });
});


function hideHistory() {
    $("#history").hide();
}

function showHistory() {
    $("#history").show();
}

function showTools(thisEl) {
    var awc = false;//флаг true-деканат выставил причину пропуска и крест не показывать
    if (thisEl.text() != "") {
        thisEl.find("div.triangle-topright").show();
        if (path == "z.php") {
            var c_res = thisEl.text().split("/");
            for (var i = 0; i < c_res.length; i++) {
                if (((absenteeisms_with_cause[0].indexOf(c_res[i]) != -1) || (absenteeisms_with_cause[1].indexOf(c_res[i]) != -1)) && (c_res[i]!="Н")) {
                    var awc = true;
                }
            }
            if (awc === false) {
                thisEl.find("img.close").show();
            }
        }
    }
}

function hideTools(thisEl) {
    if (thisEl.text() != "") {
        //gradeWithTriangle=thisEl.find("div.triangle-topright");
        thisEl.find("div.triangle-topright").hide();
        if (path == "z.php") {
            thisEl.find("img.close").hide();
        }
    }
}

function resize() {
    $windows_wid = $("body").width();// ширина монитора
    $fio_div_wid = $("div.fio_student").width() + 20;// ширина столбика с ФИО; 20-отступ справа
    // $stat_div_wid = $("div.statistic").width() + 10;//ширина столбика статистики; 10-отступ справа
    $stat_div_wid = $("div.statistic").width();//ширина столбика статистики; 10-отступ справа
    //ширина блока с оценками
    $left_div_stat = $windows_wid - $stat_div_wid - 5; //левая граница блока статистики


    if($left_div_stat<=$fio_div_wid+50){
        $("div.statistic").hide();
        $stat_div_wid=0;
    }
    else{
        $("div.statistic").show();
        $stat_div_wid = $("div.statistic").width();
    } 
    $result_div = $windows_wid - $fio_div_wid - $stat_div_wid - 25;

    $("div.result_box").css("left", $fio_div_wid);
    $("div.result_box").css("width", $result_div);
    $("div.statistic").css("left", $left_div_stat);
    $("div#history").fadeOut(1000);

}

//Функция уменьшения размера шрифта, чтобы отметки помещались в ячейку
function smallText(object){
    if (object.text().length >= 7) {
        object.addClass("small-text");
    }
}

//Функция обесцвечивания, где уже сгенерирован платеж, но еще не оплачен
function generatedPayText(object){
    if(object.attr("data-status")==1){
        object.addClass("genPayText");
    }
    else if(object.attr("data-status")==2){
        object.addClass("sucPayText");
    }
}

//проверка сенсорное ли устройство
function is_touch_device() {
    return ('ontouchstart' in window) || ('onmsgesturechange' in window);
}

function ShowLogTools() {
    //Дорисовка треугольника
    $("div.grade").each(function () {
        if (($(this).text() != "") && ($(this).attr('data-zapis') != "0")) { //ид-запись=0 где нету оценок
            smallText($(this));
            generatedPayText($(this));
            $(this).append('<div class="triangle-topright"></div>');
            $("div.triangle-topright").hide();
            if (path == "z.php") {
                $(this).append('<img src="img/close.png" class="close" title="Удалить оценку">');
                $("img.close").hide();
            }
        }
    });
}

//Функция выделения красным цветом поля, где есть Н без причины
function illuminationAbs(elem) {
    if (elem.text() != "") {
        var block=isAbs(elem);
        (block==1)? elem.addClass("undef"):"";
    }
}

function isAbs(elem) {
    var c_res = elem.text().split("/");
    for (var i = 0; i < c_res.length; i++) {
        if(absenteeisms.indexOf(c_res[i]) != -1){
            return 1;
        }
    }
}

//Функция проверки есть ли в сочетанной оценке что-то кроме Н
function isGrade(elem) {
    var c_res = elem.text().split("/");
    var retRes=0;
    for (var i = 0; i < c_res.length; i++) {
        if(absenteeisms_with_cause.indexOf(c_res[i]) == -1){
            retRes=1;
        }
    }
    return retRes;
}

//Функция вычисления ср балл для студентов для зав каф и препод
function updateAvg(idStudent, dom_obj) {
    var sum = 0, countGrade = 0, avg = 0;
    $('div.grade[data-idStudent="' + idStudent + '"]').each(function () {
        var gr = $(this).text().split("/");
        for (var i = 0; i < gr.length; i++) {
            if (Number(gr[i])) {
                sum += Number(gr[i]);
                countGrade++;
            }
        }
    });
    avg = (sum / countGrade).toFixed(1);
    avg = (isNaN(avg)) ? "" : avg;
    var c_obj=$('div.'+dom_obj+'[data-idStudent="' + idStudent + '"]');
    (avg < 4) ? c_obj.html(avg).addClass("fail") : c_obj.html(avg);
    updateAvgAvg("avg_avrige");
}

//функция вычисления ср балла группы
function updateAvgAvg(dom_obj) {
    var avg_sum = 0, avg_count = 0, avgResult = 0;
    var count = $("div.avg_small").length;
    for (var k = 0; k < count - 1; k++) {
        var elem = $("div.avg_small:eq(" + k + ")").text();
        if (elem != "") {
            avg_sum += Number(elem);
            avg_count++;
        }
    }
    avgResult = (avg_sum / avg_count).toFixed(1);
    avgResult = (isNaN(avgResult)) ? "" : avgResult;
    $("div#"+dom_obj).html(avgResult);
}

function updateAns(idStudent, dom_obj) {
    var countAnswer = 0;
    $('div.grade[data-idStudent="' + idStudent + '"]').each(function () {
        var gr = $(this).text().split("/");
        if (Number(gr[0])) {
            countAnswer++
        }
    });
    var res = (100 * countAnswer / $('div.grade[data-idStudent="' + idStudent + '"]').length).toFixed(0);
    res = (isNaN(res) || res == 0) ? "" : res;
    var c_obj=$('div.'+dom_obj+'[data-idStudent="' + idStudent + '"]');
    (res < 40) ? c_obj.html(res).addClass("fail") : c_obj.html(res);
}

function updateAbs(idStudent, dom_obj) {
    var countAbsenteesm = 0, countAbsRespect = 0;
    $('div.grade[data-idStudent="' + idStudent + '"]').each(function () {
        var gr = $(this).text().split("/");
        for (i = 0; i < gr.length; i++) {
            if ((absenteeisms.indexOf(gr[i]) != -1) || (absenteeisms_with_cause.indexOf(gr[i]) != -1)) {
                countAbsenteesm++;
                if (gr[i] == "Ну") {
                    countAbsRespect++;
                }
            }
        }
    });
    var res = countAbsenteesm + "(" + countAbsRespect + ")";
    res = (countAbsenteesm == 0 && countAbsRespect == 0) ? "" : res;
    $('div.'+dom_obj+'[data-idStudent="' + idStudent + '"]').html(res);
}

//функция преобразования записи к индексированному виду
function lowIndex(str) {
    var gr = str.split("/");
    var res="";
    for (i = 0; i < gr.length; i++) {
        if ((absenteeisms.indexOf(gr[i]) != -1) || (absenteeisms_with_cause.indexOf(gr[i]) != -1)) {
             var head=gr[i].substr(0,1);
             var index=gr[i].slice(1);
             gr[i]=head+"<sub>"+index+"</sub>";
             //console.log(gr[i]);
        }
    }
    res = gr.join('/');
    return res;
}

//Функция возвращает 1 если в записи есть Ну или Нб.о
function typeAbs(str){
    var gr = str.split("/");
    var res=0;
    for (i = 0; i < gr.length; i++) {
        //if ((absenteeisms_with_cause[0].indexOf(gr[i]) != -1) || (absenteeisms_with_cause[2].indexOf(gr[i]) != -1)) { //проблема: не ищет "Н"
        if ((absenteeisms_with_cause[0] == gr[i]) || (absenteeisms_with_cause[2] == gr[i])) {
             res=1;
        }
    }
    return res;
}

//Ф-я возврата сегодняшней даты
function getCurrentDate(){
    var cr_d = new Date();
    var cr_dStr = cr_d.getDate() + "." + Number(cr_d.getMonth() + 1) + "." + cr_d.getFullYear();
    return cr_dStr;
}

// //Ф-я с окном для подтверждения оплаты для декана ALT+dblclick
// function showConfirmMakePay(operationMenu, elem=null){
//     var confirm_make_pay, confirm_make_form;

//     //Форма подтверждения оплаты
//     confirm_make_pay = $("#form-make-pay").dialog({
//         resizable: false,
//         autoOpen: false,
//         height: 'auto',
//         width: 240,
//         modal: true,
//         buttons: {
//             "Да": function(){
//                 console.log(operationMenu);
//                 console.log(elem);
//                 var arrIdGrades= new Array();
//                 $('div.selected').each(function () {
//                     arrIdGrades.push($(this).find('.Otmetka').attr("data-zapis"));
//                 });

//                 // $.ajax({
//                 //     type: 'get',
//                 //     url: 'd.php',
//                 //     data: {
//                 //         'id_Zapis': arrIdGrades,
//                 //         'menuactiv': "arrayMakePaid",
//                 //         'ajaxTrue': "1"
//                 //     },
//                 //     success: function (st) {
//                 //         if (st == "Access is denied!") {
//                 //             alert("Извините, время вашей рабочей сессии истекло. Пожалуйста, закройте браузер и заново авторизуйтесь.");
//                 //         }
//                 //         else if (st == "No access rights!") {
//                 //             alert("Не достаточно прав!");
//                 //         }
//                 //         else{
//                 //             //location.reload();
//                 //         }
//                 //     },
//                 //     error: function () {
//                 //         alert("Произошла ошибка при передаче данных");
//                 //     }
//                 // });

//                 confirm_make_pay.dialog("close");
//             },
//             "Отмена": function () {
//                 confirm_make_pay.dialog("close");
//             }
//         }
//     });
//     confirm_make_form = confirm_make_pay.find("form").on("submit", function (event) {
//         event.preventDefault();
//     });

//     confirm_make_pay.dialog("open");
// }