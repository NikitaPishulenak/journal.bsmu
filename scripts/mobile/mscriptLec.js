var edit_dialog, edit_form, edit_date_dialog, edit_date_form;
var edit_grade_flag = 0, edit_dateTitle_flag=0;

// ������ ������� ��� ����������� ������
$('div').delegate(".grade", "touchstart", function () {
    elGrade=$(this);
    edit_grade_flag = 1;
});
$('div').delegate(".grade","touchend", function () {
    edit_grade_flag = 0;
});
$('div').delegate(".grade","touchmove", function () {
    edit_grade_flag = 0;
});

// ������ ������� ��� �������������� ����
$('div').delegate(".date_title", "touchstart", function () {
    elDateTitle=$(this);
    edit_dateTitle_flag = 1;
});
$('div').delegate(".date_title","touchend", function () {
    edit_dateTitle_flag = 0;
});
$('div').delegate(".date_title","touchmove", function () {
    edit_dateTitle_flag = 0;
});


setInterval(function(){
    if(edit_grade_flag == 1) {
        edit_grade_flag=0;
        create_new_grade(elGrade);
    }
    else if(edit_dateTitle_flag==1) {
        edit_dateTitle_flag==0;
        create_new_dateTitle(elDateTitle);
    }
},1000);



//�������������� �������
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

//����� �������������� ����-���� ������� � ������ ����
edit_date_dialog = $("#form-edit-date").dialog({
    resizable: false,
    autoOpen: false,
    modal: true,
    buttons: {
        "��������": editDate,
        "������": function () {
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
    dat=(dat.length==9)? "0" + dat : dat;
    if($("#edit-lesson-date").val()!=""){
        var new_date=$("#edit-lesson-date").val();// ���� ����� ���������
        var new_number_theme_lesson=$('input#edit_number_theme').val();
        (new_number_theme_lesson=="") ? new_number_theme_lesson=0 : new_number_theme_lesson;

        if((dat!=new_date) || (new_number_theme_lesson!=numb_theme_lesson)){
            //������ ����
            $.ajax({
                type:'get',
                url:'p.php',
                data:{
                    'Date': new_date,
                    'PKE': "0",
                    'idGroup': $("input#idGroup").val(),
                    'idLesson': id_Lesson,
                    'numberThemeLesson':new_number_theme_lesson,
                    'menuactiv': "editDate",
                    'ajaxTrue':"1"
                },
                success:function (st) {
                    if ((st!="Access is denied!")&&(st!="No access rights!")){
                        dat_col_object.html(new_date);
                        window.location.reload();
                    }
                    else{
                        if (st=="Access is denied!"){
                            alert("��������, ����� ����� ������� ������ �������. ����������, �������� ������� � ������ �������������.");
                        }
                        else if (st=="No access rights!"){
                            alert("�� ���������� ����!");
                        }
                        else{
                            alert("���-�� ����� �� ���! ");
                        }

                    }
                },
                error: function () {
                    alert("��������� ������ ��� �������� ������");
                }
            });

            edit_date_dialog.dialog("close");
        }
        else{
            alert("��� ���������� ���������� �������� ����! � ���� ������ ������� ������ '������'");
        }
    }
}

function create_new_grade(e) {
    edit_grade_flag = 0;
    var curStatus=e.attr("data-Status");
    var isGr=isGrade(e);

    if(e.attr("data-status")==2){
        $("div#item_grade").html(items_grade[5]);
    }else{
        $("div#item_grade").html(items_grade[4]);
    }

    $("button#edit").removeAttr('disabled');
    $("button#close").removeAttr('disabled');
    dat=e.parent().find('div.date_title').html();
    student_id=e.attr('data-idStudent');
    id_Less=e.attr('data-idLes');
    id_Zapis=e.attr('data-zapis');
    edit_dialog.dialog("open");
    edit_form[0].reset();

    var data_studentID=e.attr('data-idStudent');
    var fio_stud=$('div.fio_student[data-idStudent="'+data_studentID+'"]').text();
    edit_dialog.dialog({title: fio_stud});
    $("#inp_0").focus();
    cur_grade = e.text();
    elem = e;
    grades = cur_grade.split("/");
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
                    $(".inp_cell").attr('disabled', 'disabled');
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
                    $("#inp_" + i).removeAttr('disabled');
                    $("div.panel").find('input#inp_' + i).slideDown(1);
                    $("div.panel").find('input#inp_' + i).val(grades[i]);
                    $("#inp_" + i).blur();
                }
            break;
        }
    
    $('input#inp_0').focus();
    $('input#inp_0').select();
    $(".inp_cell:text").focus(function () {
        inp_id = $(this).attr('id');

        //��� ������� �� ������ � ������������ ����� ��������� � ���� �����
        $("b.tool, span.tool").on("touchstart", function (){
            var text = $(this).text();
            $("#" + inp_id+":enabled").val(text);
            $("#" + inp_id).blur();
        });
    });
    var absenteeism = /\w/;
    $(".inp_cell:text").keydown(function (event) {
        if (event.keyCode == 8 || event.keyCode == 46) {   //���� ��� ��������
            if (!absenteeism.test(this.value)) {
                $(this).val("")
            }
        }
    });
}

function create_new_dateTitle(e) {
    edit_dateTitle_flag = 0;
    dat=e.parent().find('div.date_title').html();//���� �������
    dat_col_object=e.parent().find('div.date_title');// ������ �������� ����������� ��������
    id_Lesson=e.attr('data-idLesson');
    numb_theme_lesson=e.attr('data-number_theme_lesson');
    edit_date_dialog.dialog("open");
    edit_date_form[0].reset();
    edit_date_dialog.dialog({title: dat});
    $("#edit-lesson-date").val(dat);
    (numb_theme_lesson=="0") ? $('input#edit_number_theme').val("") : $('input#edit_number_theme').val(numb_theme_lesson);
    $('.datepicker').datepicker("setDate", dat.toString());

}
