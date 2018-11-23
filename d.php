<?php
unset($_SESSION['SesVar']);
session_start();

ini_set("display_errors", 1);

if(!isset($_SESSION['SesVar']['Auth']) || $_SESSION['SesVar']['Auth']!==true){
   if(isset($_GET['ajaxTrue']) && $_GET['ajaxTrue']){
    echo "Access is denied!";
    exit;
   } else {
      header('Location: index.php?closet=Время сессии истекло!');
      exit;
   }
}

$Nepuschu=0;
$countLev=count($_SESSION['SesVar']['Level']);
for($ii=0; $ii<=($countLev-1); $ii++){
    if($_SESSION['SesVar']['Level'][$ii]==2) $Nepuschu=1;
}

if(!$Nepuschu){
    header('Location: index.php?closet=Запрещённый уровень доступа! Досвидос.');
    exit;
}

if(isset($_GET['idF']) && $_SESSION['SesVar']['Dekan'][2]!=$_GET['idF']){
   if(isset($_GET['ajaxTrue']) && $_GET['ajaxTrue']){
      echo "Access is denied!";
      exit;
   } else {
      header('Location: index.php?closet=Доступ к этому факультету запрещён! Arrivederci.');
      exit;
   }
}


if(isset($_GET['menuactiv'])){
    switch($_GET['menuactiv']) {

        case "makePaid":
            if(isset($_GET['id_Zapis']) && is_numeric($_GET['id_Zapis']) && isset($_GET['ajaxTrue']) && $_GET['ajaxTrue']){
               VirtualPay($_GET['id_Zapis']);
            }
            break;

        case "editGroupInfo":
            if(isset($_GET['idGroup']) && is_numeric($_GET['idGroup']) && isset($_GET['ajaxTrue']) && $_GET['ajaxTrue']){
               ViewKurs($_GET['idGroup']);
            }
            break;

        case "arrayMakePaid":
            if(isset($_GET['ajaxTrue']) && $_GET['ajaxTrue']){
               VirtualPayArray($_GET['id_Zapis']);
            }
            break;

        case "OldPizdabol":
            ViewOldLesson();
            break;

        case "OpenDetails":
            if(isset($_GET['idSubject']) && is_numeric($_GET['idSubject']) && isset($_GET['idStudent']) && is_numeric($_GET['idStudent'])){
                $_GET['idSubject'] = substr($_GET['idSubject'],0,4);
                $_GET['idStudent'] = substr($_GET['idStudent'],0,6);
                GroupVP($_GET['idSubject'], $_GET['idStudent']);
            } else {
                echo "<div class='Not'>Что-то пошло не так!</div>";
            }
            break;

        case "repAbsenteeisms":
            edtLessonStudentUP();
            break;

        case "SearchStudent":
            SearchStudent();
            break;

        case "SearchStudentGo":
            SearchGiveData();
            break;

        case "editLessonStudent":
            edtLessonStudent();
            break;

        case "goG":
            if($_GET['PL']==0){
                GroupViewP();
            } else if ($_GET['PL'] == 1){
                GroupViewL();
            }
            break;

        case "goF":
            Fakultet();
            break;

        default:
            if(isset($_GET['v']) && $_GET['v']=='a'){
               MainF();
            } else {
               ((isset($_GET['k']) && is_numeric($_GET['k']) && $_GET['k']<=6 && $_GET['k']>0) ? Kurs($_GET['k']) : Kurs());
            }
            break;
    }
}else{
   if(isset($_GET['v']) && $_GET['v']=='a'){ MainF(); } else { ((isset($_GET['k']) && is_numeric($_GET['k']) && $_GET['k']<=6 && $_GET['k']>0) ? Kurs($_GET['k']) : Kurs()); }
}

//----------------------------------------------------------------------------------------------


function ViewKurs($idG){
   include_once 'configStudent.php';
   include_once 'configMain.php';
                                      
   $result = mssql_query("SELECT IdStud, IIF(LEN(CONCAT(Name_F,' ',Name_I,' ',Name_O))>30,CONCAT(LEFT(CONCAT(Name_F,' ',Name_I,' ',Name_O), 27),'...'),CONCAT(Name_F,' ',Name_I,' ',Name_O)) FROM dbo.Student WHERE IdGroup=".$idG." AND IdStatus IS NULL ORDER BY Name_F",$dbStud);
   if(mssql_num_rows($result)>=1){
      $retVal = "";
      while($arrStud = mssql_fetch_row($result)){
         $ress = mysqli_query($dbMain, "SELECT SUM(n20+n22), SUM(n21), SUM(ABS((n26+n31+n32+n33+n34+n35+n36+n37+n40+n41+n42+n43+n44+n45)-(n20+n21+n22))) FROM aerostat WHERE idStud=".$arrStud[0]." AND idFak=".$_SESSION['SesVar']['Dekan'][2]." GROUP BY idStud,idLessons");
            list($cntOc,$cntOcD,$cntOcC) = mysqli_fetch_row($ress);
            if($arrStud[0] == $_GET['idCaptain']){
               $retVal.="<div class='DialogKurs' data-idStudent='".$arrStud[0]."' title='Капитан шлюпки'><strong>".$arrStud[1]."</strong>"
.($cntOcC ? "<div class='CVC' title='Пропуски: ".$cntOcC."'>".$cntOcC."</div>\n" : "").($cntOc ? "<div class='CV' title='Ну+Нб.о: ".$cntOc."'>".$cntOc."</div>\n" : "").($cntOcD ? "<div class='CVD' title='Нн: ".$cntOcD."'>".$cntOcD."</div>\n" : "")."\n</div>\n";
            } else {
               $retVal.="<div class='DialogKurs' data-idStudent='".$arrStud[0]."'>".$arrStud[1]
.($cntOcC ? "<div class='CVC' title='Пропуски: ".$cntOcC."'>".$cntOcC."</div>\n" : "").($cntOc ? "<div class='CV' title='Ну+Нб.о: ".$cntOc."'>".$cntOc."</div>\n" : "").($cntOcD ? "<div class='CVD' title='Нн: ".$cntOcD."'>".$cntOcD."</div>\n" : "")."\n</div>\n";
            }
         }
      echo $retVal;
   }

}


function Kurs($k=1){

    $retVal="<p>".$_SESSION['SesVar']['Dekan'][0]." (".$_SESSION['SesVar']['Dekan'][1].")</p><hr>".FormSearch();
    $retVal.="
      <div class='DialogP'>
      <div class='titleBox'><H2>По курсам&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;<a href='d.php?v=a'>По дисциплинам</a></H2></div>
      <div class='Kurs'>
   ";

    include_once 'config.php';
    include_once 'configStudent.php';

    if ($_SESSION['SesVar']['Dekan'][2] == 283) {
       $och=round($fac[283][1]/12); $zaoch=ceil($fac[283][3]/12);
       if(var_dump($zaoch>=$och)){ $countK=$zaoch-1; } else { $countK=$och-1; }
    } else {
       $countK=floor($fac[$_SESSION['SesVar']['Dekan'][2]][1]/12)-1;
    }


      for($iS=0; $iS<=$countK; $iS++){
         if(($iS+1) == $k){
           $retVal.="<div class='KursCount Curr'>".($iS+1)."-й</div>";   
         } else {
           $retVal.="<a href='d.php?k=".($iS+1)."&idPrepod=".$_SESSION['SesVar']['FIO'][0]."'><div class='KursCount'>".($iS+1)."-й</div></a>";
         }
      }
      $retVal.="<div style='clear:both;'>&nbsp;</div>";



            if ($_SESSION['SesVar']['Dekan'][2] == 283) {
                $sqlS="(DATEDIFF(month,CONCAT(Year,'0101'),GETDATE())<".$fac[$_SESSION['SesVar']['Dekan'][2]][1]." OR DATEDIFF(month,CONCAT(Year,'0101'),GETDATE())<".$fac[$_SESSION['SesVar']['Dekan'][2]][3].")";
            } else {
               $sqlS="DATEDIFF(month,CONCAT(Year,'0101'),GETDATE())<".$fac[$_SESSION['SesVar']['Dekan'][2]][1];
//                $sqlS="DATEDIFF(year,CONCAT(Year,'0101'),GETDATE())<=".$k;
            }


            $sqlSO="(IdF=".$_SESSION['SesVar']['Dekan'][2]." AND SUBSTRING(Name,2,1)='".$k."' AND ".$sqlS." AND LEN(Name)>=4)";
            $result = mssql_query("SELECT IdGroup, Name, IIF(IdCaptain!=null, IdCaptain, 0), IIF(IdF != ".$_SESSION['SesVar']['Dekan'][2].", 1, 0) FROM dbo.Groups WHERE ".$sqlSO." ORDER BY Name", $dbStud);
            if (mssql_num_rows($result) >= 1) {
                $preChar = "";
                while ($arr = mssql_fetch_row($result)) {
                    if ($preChar != substr($arr[1], 0, 2)) $retVal .= "<div class='HRnext'></div>";
                    $preChar = substr($arr[1], 0, 2);
                    $retVal .= "<div class='DialogGrKurs' data-nGroup=".$arr[1]." data-idGroup=".$arr[0]." data-IdCaptain=".$arr[2]."><strong>".$arr[1]."</strong>".($arr[3] ? "<div class='Inostr' title='Группа иностранных учащихся'>и</div>" : "")."<span class='fullTextClose' title='Закрыть'>X</span>\n<div class='content_grade'></div></div>\n";
                }
            }




    $retVal.="</div></div>\n";
    echo HeaderFooterKurs($retVal, $_SESSION['SesVar']['Dekan'][0]." (".$_SESSION['SesVar']['Dekan'][1].")", $verC, $verS);
}





//----------------------------------------------------------------------------------------------



function VirtualPayArray($idZapis){
   $countSt = count($idZapis);
   if($countSt>=1){
      $countSt-=1;
      include_once 'configMain.php';
      for($iS=0; $iS<=$countSt; $iS++){
         mysqli_query($dbMain, "UPDATE rating SET dateVirtualPay=CURRENT_TIMESTAMP(), idDekan=".$_SESSION['SesVar']['FIO'][0].", pStatus=2 WHERE del=0 AND pStatus=0 AND id=".$idZapis[$iS]." AND (RatingO LIKE '21%' OR RatingO LIKE '__21%' OR RatingO LIKE '____21')");
      }
   } else {
      echo "No";
   }
}

function VirtualPay($idZapis){
   include_once 'configMain.php';
   mysqli_query($dbMain, "UPDATE rating SET dateVirtualPay=CURRENT_TIMESTAMP(), idDekan=".$_SESSION['SesVar']['FIO'][0].", pStatus=2 WHERE del=0 AND pStatus=0 AND id=".$idZapis." AND (RatingO LIKE '21%' OR RatingO LIKE '__21%' OR RatingO LIKE '____21')");
}


function ViewOldLesson(){
   include_once 'configMain.php';

   $resultS = mysqli_query($dbMain, "SELECT DATE_FORMAT(B.LDate,'%e.%m.%Y'), A.RatingO, A.PKE, A.pStatus, A.Nn, B.nLesson FROM rating A LEFT JOIN lesson B ON (B.id=A.idLesson) WHERE A.idStud=".$_GET['idStudent']." AND A.idLessons=".$_GET['idSubject']." AND A.nGroup<>'".$_GET['nGroup']."' AND A.PL=".$_GET['idPL']." AND A.del=0 ORDER BY B.LDate");
   if(mysqli_num_rows($resultS)>=1){
      $retVal="";
      while($arrSS = mysqli_fetch_row($resultS)){
         switch($arrSS[2]){
            case 1:
               $retVal.="<div class='Oc Koll' title='Коллоквиум / История болезни'><div class='DataO'>".($arrSS[5] ? "<div class='nLessonOld'>".$arrSS[5]."</div>" : "").$arrSS[0]."</div><div class='Otmetka' data-Nn=".$arrSS[4].">".$arrSS[1]."</div></div>\n";   
               break;
            case 2:
               $retVal.="<div class='Oc Exm' title='Аттестация'><div class='DataO'>".($arrSS[5] ? "<div class='nLessonOld'>".$arrSS[5]."</div>" : "").$arrSS[0]."</div><div class='Otmetka' data-Nn=".$arrSS[4].">".$arrSS[1]."</div></div>\n";
               break;
            default:
               $retVal.="<div class='Oc'><div class='DataO'>".($arrSS[5] ? "<div class='nLessonOld'>".$arrSS[5]."</div>" : "").$arrSS[0]."</div><div class='Otmetka' data-Nn=".$arrSS[4].">".$arrSS[1]."</div></div>\n";
               break;
         }
 
      }
      mysqli_free_result($resultS);
      echo $retVal;
      unset($retVal);
   } else {
      echo "<div class='Not'>По данной дисциплине отметок нет!</div>";
   }
}



function edtLessonStudentUP(){
    include_once 'configMain.php';

    if(is_numeric($_GET['idStudent'])){
        if(isset($_GET['nGroup']) && $_GET['nGroup']){ $nGr=trim(substr($_GET['nGroup'],0,6)); } else { $nGr=""; }
        $countSt = count($_GET['arrGrade']);
        if($countSt>=1){
            $countSt-=1;
            for($iS=0; $iS<=$countSt; $iS++){
                $resTime = mysqli_query($dbMain, "SELECT TIMESTAMPDIFF(MINUTE, CONCAT(DateO, ' ', TimeO), NOW()), idLessons, idLesson, DateO, TimeO, RatingO, idEmployess, levEmployess FROM rating WHERE del=0 AND id=".$_GET['arrGrade'][$iS][0]." AND idStud=".$_GET['idStudent']);
                if (mysqli_num_rows($resTime) >= 1) {
                    $arr = mysqli_fetch_row($resTime);
                    if($arr[6]!=$_SESSION['SesVar']['FIO'][0] || $arr[0] > 10 || $arr[7]!=2){
                        mysqli_query($dbMain, "INSERT INTO logi (idRating,idLessons,idLesson,idStud,DateO,TimeO,RatingO,idEmployess) VALUES (".$_GET['arrGrade'][$iS][0].",".$arr[1].",".$arr[2].",".$_GET['idStudent'].",'".$arr[3]."','".$arr[4]."',".$arr[5].",".$arr[6].")");
                        mysqli_query($dbMain, "UPDATE rating SET DateO=CURDATE(), TimeO=CURTIME(), RatingO=".$_GET['arrGrade'][$iS][1].", idEmployess=".$_SESSION['SesVar']['FIO'][0].", levEmployess=2 WHERE del=0 AND pStatus=0 AND id=".$_GET['arrGrade'][$iS][0]." AND idStud=".$_GET['idStudent']);
                    }else{
                        mysqli_query($dbMain, "UPDATE rating SET RatingO=".$_GET['arrGrade'][$iS][1].", idEmployess=".$_SESSION['SesVar']['FIO'][0].", levEmployess=2 WHERE del=0 AND pStatus=0 AND id=".$_GET['arrGrade'][$iS][0]." AND idStud=".$_GET['idStudent']);
                    }

                    $strUpdate = ExpImp($arr[5], $_GET['arrGrade'][$iS][1]);
                    if($strUpdate) mysqli_query($dbMain, "UPDATE aerostat SET ".$strUpdate." WHERE idStud=".$_GET['idStudent']." AND idLessons=".$_GET['idLessons']." AND idFak=".$_SESSION['SesVar']['Dekan'][2]." AND nGroup='".$nGr."'");

                    mysqli_free_result($resTime);
                }
            }
        } else {
            echo "No";
        }
    } else {
        echo "No";
    }
}


function SearchStudent(){
    include_once 'configStudent.php';

    $_GET['Swords'] = trim(htmlspecialchars(substr($_GET['Swords'],0,100)));
    $retVal="<p>".$_SESSION['SesVar']['Dekan'][0]." (".$_SESSION['SesVar']['Dekan'][1].")</p><a href='d.php'>&larr; вернуться</a><hr>".FormSearch($_GET['Swords']);
    if($_GET['Swords']!=""){
        if(is_numeric($_GET['Swords']) && strlen($_GET['Swords'])===7){
            $preSQL = "A.NomZ='".$_GET['Swords']."' AND";
        } else {
            $preSQL = "A.Name_F LIKE '%".$_GET['Swords']."%' AND";
        }
        $result = mssql_query("SELECT A.IdStud, CONCAT(A.Name_F,' ',A.Name_I,' ',A.Name_O), A.IdKurs, B.Name, A.NomZ, B.IdGroup, LEFT(B.Name,1) FROM dbo.Student A LEFT JOIN dbo.Groups B ON (B.IdGroup=A.IdGroup) WHERE ".$preSQL." A.IdF=".$_SESSION['SesVar']['Dekan'][2]." AND A.IdStatus IS NULL ORDER BY A.Name_F",$dbStud);
        if(mssql_num_rows($result)>=1){
            $i = 1;
            while ($arr = mssql_fetch_row($result)) {
                $retVal.="<div class='StudentNaVibor'>".$i.". <a href='d.php?menuactiv=SearchStudentGo&idSt=".$arr[0]."&kursSt=".$arr[2]."&idgroupSt=".$arr[5]."&groupSt=".$arr[3]."&gfnS=".$arr[6]."&nomzSt=".$arr[4]."&nameSt=".trim($arr[1])."'>".trim($arr[1])."</a> (гр. ".$arr[3].", ".$arr[2]."-й курс, № <strong>".$arr[4]."</strong>)</div>\n";
                $i++;
            }
            mssql_free_result($result);
        } else {
            $retVal.="<H1>Извините, студент не найден!</H1>";
        }
    } else {
        $retVal.="<H1>Извините, студент не найден!</H1>";
    }
    unset($result, $preSQL);
    echo HeaderFooter($retVal, $_SESSION['SesVar']['Dekan'][0]." (".$_SESSION['SesVar']['Dekan'][1].")", $verC);
}


function SearchGiveData()
{
    include_once 'configMain.php';
    include_once 'config.php';
    include_once 'configStudent.php';


    $res = mysqli_query($dbMain, "SELECT A.id_lesson, B.name, IF(CHAR_LENGTH(B.name)>70,CONCAT(LEFT(B.name, 67),'...'),B.name) FROM schedule A LEFT JOIN lessons B ON B.id=A.id_lesson WHERE A.course=".$_GET['kursSt']." AND A.id_faculty=".$_SESSION['SesVar']['Dekan'][2]." GROUP BY A.id_lesson ORDER BY B.name");

    $retVal="\n<input type='hidden' id='idStudent' value='".$_GET['idSt']."'>
<input type='hidden' id='nGroup' value='".$_GET['groupSt']."'>
<hr><H2>".$_GET['nameSt']." (гр. ".$_GET['groupSt'].", ".$_GET['kursSt']."-й курс, № ".$_GET['nomzSt'].")</H2>";

    if (mysqli_num_rows($res)>=1) {
        $retVal.="\n<div class='DialogP'><div class='titleBox'><H2>Дисциплина</H2></div>\n";
//      $ress = mysqli_query($dbMain, "SELECT COUNT(id) FROM rating WHERE (idLessons=".$arr[0]." AND idStud=".$_GET['idSt']." AND del=0) AND (RatingO LIKE '3%' OR RatingO LIKE '__3%' OR RatingO LIKE '____3%' OR RatingO LIKE '4%' OR RatingO LIKE '__4%' OR RatingO LIKE '____4%' OR RatingO LIKE '26%' OR RatingO LIKE '__26%' OR RatingO LIKE '____26' OR RatingO LIKE '20%' OR RatingO LIKE '__20%' OR RatingO LIKE '____20' OR RatingO LIKE '21%' OR RatingO LIKE '__21%' OR RatingO LIKE '____21' OR RatingO LIKE '22%' OR RatingO LIKE '__22%' OR RatingO LIKE '____22')");
        while ($arr = mysqli_fetch_row($res)) {

            $ress = mysqli_query($dbMain, "SELECT SUM(n20+n22), SUM(n21), SUM(ABS((n26+n31+n32+n33+n34+n35+n36+n37+n40+n41+n42+n43+n44+n45)-(n20+n21+n22))) FROM aerostat WHERE idLessons=".$arr[0]." AND idStud=".$_GET['idSt']." AND idFak=".$_SESSION['SesVar']['Dekan'][2]." GROUP BY idStud,idLessons");
            list($cntOc,$cntOcD,$cntOcC) = mysqli_fetch_row($ress);
            $retVal.="<div class='DialogFakFak' data-idSubject='".$arr[0]."'>\n<span class='shortText'>".$arr[2]."</span>\n<span class='fullText'>".$arr[1]."</span>&nbsp;<span class='fullTextClose' title='Закрыть'>X</span>\n<div class='content_grade'></div>\n"
.($cntOcC ? "<div class='COC' title='Пропуски: ".$cntOcC."'>".$cntOcC."</div>\n" : "").($cntOc ? "<div class='CO' title='Ну+Нб.о: ".$cntOc."'>".$cntOc."</div>\n" : "").($cntOcD ? "<div class='COD' title='Нн: ".$cntOcD."'>".$cntOcD."</div>\n" : "")."\n</div>\n";

        }
        unset($arr,$cntOc);
        mysqli_free_result($res);
        mysqli_free_result($ress);

    }

    $retVal.="</div>\n";

    echo HeaderFooterSearch($retVal, $_SESSION['SesVar']['Dekan'][0]." (".$_SESSION['SesVar']['Dekan'][1].")", $verC, $verS);

}



function GroupVP($idSu, $idSt){

    include_once 'configMain.php';

    $resultS = mysqli_query($dbMain, "SELECT DATE_FORMAT(B.LDate,'%e.%m.%Y'), A.RatingO, A.PL, A.PKE, A.id, A.pStatus, A.Nn FROM rating A LEFT JOIN lesson B ON (B.id=A.idLesson) WHERE A.idStud=".$idSt." AND A.idLessons=".$idSu." AND A.del=0 ORDER BY A.PL,B.LDate");
    if(mysqli_num_rows($resultS)>=1){
        $retVal="<div class='menuTools'><div class='popup-content' id='history'><span id='log_text'></span></div><div id='selAll' class='sel_tool'>Выделить всё</div><div id='canselSelAll' class='sel_tool'>Отменить</div><div class='replaceAbs'>Заменить пропуски</div></div><div class='C'></div>";
        $trueP=0; $trueL=0;
        while($arrSS = mysqli_fetch_row($resultS)){

            if(!$arrSS[2] && !$trueP){
                $trueP = 1;
                $retVal.="<div class='titleO'>Практические</div>\n";
            } else if ($arrSS[2] && !$trueL){
                $trueL = 1;
                $retVal.="<div class='clr'></div><div class='titleO'>Лекции</div>\n";
            }
            switch($arrSS[3]){
                case 1:
                    $retVal.="<div class='Oc Koll' data-PL='".$arrSS[2]."' title='Коллоквиум / История болезни'><div class='DataO'>".$arrSS[0]."</div><div class='Otmetka' data-zapis=".$arrSS[4]." data-Status=".$arrSS[5]." data-Nn=".$arrSS[6].">".$arrSS[1]."</div><img src='img/tr.png' class='tr'></div>\n";
                    break;
                case 2:
                    $retVal.="<div class='Oc Exm' data-PL='".$arrSS[2]."' title='Аттестация'><div class='DataO'>".$arrSS[0]."</div><div class='Otmetka' data-zapis=".$arrSS[4]." data-Status=".$arrSS[5]." data-Nn=".$arrSS[6].">".$arrSS[1]."</div><img src='img/tr.png' class='tr'></div>\n";
                    break;
                default:
                    $retVal.="<div class='Oc' data-PL='".$arrSS[2]."'><div class='DataO'>".$arrSS[0]."</div><div class='Otmetka' data-zapis=".$arrSS[4]." data-Status=".$arrSS[5]." data-Nn=".$arrSS[6].">".$arrSS[1]."</div><img src='img/tr.png' class='tr'></div>\n";
                    break;
            }

        }
        mysqli_free_result($resultS);
        echo $retVal;
        unset($retVal);
    } else {
        echo "<div class='Not'>По данной дисциплине отметок ещё нет!</div>";
    }
}




//----------------------------------------------------------------------------------------------
  

function edtLessonStudent()
{
    include_once 'configMain.php';
    if(is_numeric($_GET['id_Zapis']) && is_numeric($_GET['idStudent']) && is_numeric($_GET['grades'])){
        if(isset($_GET['nGroup']) && $_GET['nGroup']){ $nGr=trim(substr($_GET['nGroup'],0,6)); } else { $nGr=""; }
        $resTime = mysqli_query($dbMain, "SELECT TIMESTAMPDIFF(MINUTE, CONCAT(DateO, ' ', TimeO), NOW()), idLessons, idLesson, DateO, TimeO, RatingO, idEmployess, levEmployess FROM rating WHERE del=0 AND id=".$_GET['id_Zapis']." AND idStud=".$_GET['idStudent']);
        if (mysqli_num_rows($resTime) >= 1) {
            $arr = mysqli_fetch_row($resTime);
            if($arr[6]!=$_SESSION['SesVar']['FIO'][0] || $arr[0] > 10 || $arr[7]!=2){
                mysqli_query($dbMain, "INSERT INTO logi (idRating,idLessons,idLesson,idStud,DateO,TimeO,RatingO,idEmployess) VALUES (".$_GET['id_Zapis'].",".$arr[1].",".$arr[2].",".$_GET['idStudent'].",'".$arr[3]."','".$arr[4]."',".$arr[5].",".$arr[6].")");
                mysqli_query($dbMain, "UPDATE rating SET DateO=CURDATE(), TimeO=CURTIME(), RatingO=".$_GET['grades'].", idEmployess=".$_SESSION['SesVar']['FIO'][0].", levEmployess=2 WHERE del=0 AND pStatus=0 AND id=" . $_GET['id_Zapis'] . " AND idStud=" . $_GET['idStudent']);
            }else{
                mysqli_query($dbMain, "UPDATE rating SET RatingO=".$_GET['grades'].", idEmployess=".$_SESSION['SesVar']['FIO'][0].", levEmployess=2 WHERE del=0 AND pStatus=0 AND id=".$_GET['id_Zapis']." AND idStud=".$_GET['idStudent']);
            }
            $strUpdate = ExpImp($arr[5], $_GET['grades']);
            if($strUpdate) mysqli_query($dbMain, "UPDATE aerostat SET ".$strUpdate." WHERE idStud=".$_GET['idStudent']." AND idLessons=".$_GET['idLessons']." AND idFak=".$_GET['idF']." AND nGroup='".$nGr."'");

            mysqli_free_result($resTime);
        }
    } else {
        echo "No";
    }
}


function ExpImp($oldGrades, $Grades)
{
   $strI = Array(); $strU = "";
   $arOld=str_split($oldGrades, 2); $arcount = count($arOld);
   $ar=str_split($Grades, 2);
   for($iS=0; $iS<=($arcount-1); $iS++){
      if($ar[$iS]!=$arOld[$iS]){
         if($arOld[$iS]!=20 && $arOld[$iS]!=21 && $arOld[$iS]!=22){
            $strI['n'.$ar[$iS]]++;
         } else {
            $strI['n'.$arOld[$iS]]-=1;                     
            $strI['n'.$ar[$iS]]++;
         }
      }
   }
   $firstLine = 0;
   while(list($key,$val) = each($strI)){ if(!$firstLine){ $strU=$key."=".$key.($val<0 ? $val : "+".$val); $firstLine=1; } else { $strU.=",".$key."=".$key.($val<0 ? $val : "+".$val); } } 
   return $strU;
}



//----------------------------------------------------------------------------------------------


function GroupViewL(){

    include_once 'configStudent.php';
    include_once 'configMain.php';
    $retVal="<p>".$_SESSION['SesVar']['Dekan'][0]." (".$_SESSION['SesVar']['Dekan'][1].")</p>";

    $retVal .= "<h3><a href='d.php?v=a'>" . $_GET['nPredmet'] . "</a><br>&nbsp;<font color='#ff0000'>&darr;</font><br>";
    $retVal .= "<a href='d.php?menuactiv=goF&idPrepod=".$_SESSION['SesVar']['FIO'][0]."&idPredmet=".$_GET['idPredmet']."&idF=".$_SESSION['SesVar']['Dekan'][2]."'>".$_GET['nF']."</a><br>&nbsp;<font color='#ff0000'>&darr;</font><br>";
    $retVal.="Группа № ".$_GET['nGroup']." (<a href='d.php?menuactiv=goG&idPrepod=".$_SESSION['SesVar']['FIO'][0]."&idPredmet=".$_GET['idPredmet']."&idF=".$_SESSION['SesVar']['Dekan'][2]."&idGroup=".$_GET['idGroup']."&PL=0&nPredmet=".$_GET['nPredmet']."&nF=".$_GET['nF']."&nGroup=".$_GET['nGroup']."&IdCaptain=".$_GET['IdCaptain']."'>Практическое</a> / ЛЕКЦИЯ)</h3><hr>";


    $retVal.="
    <input type='hidden' id='idSubject' value='".$_GET['idPredmet']."'>
    <input type='hidden' id='nSubject' value='" . $_GET['nPredmet'] . "'>
    <input type='hidden' id='idPrepod' value='".$_GET['idPrepod']."'>
    <input type='hidden' id='idGroup' value='".$_GET['idGroup']."'>
    <input type='hidden' id='nGroup' value='".$_GET['nGroup']."'>
    <input type='hidden' id='idF' value='".$_SESSION['SesVar']['Dekan'][2]."'>
    <input type='hidden' id='idPL' value='1'>";

    $result = mssql_query("SELECT IdStud, CONCAT(Name_F,' ',Name_I,' ',Name_O) FROM dbo.Student WHERE IdGroup=".$_GET['idGroup']." AND IdStatus IS NULL ORDER BY Name_F",$dbStud);
    $resultL = mysqli_query($dbMain, "SELECT id, LDate, PKE, DATE_FORMAT(LDate,'%e.%m.%Y'), nLesson FROM lesson WHERE idGroup=".$_GET['idGroup']." AND idLessons=".$_GET['idPredmet']." AND PL=1 ORDER BY LDate,id");

    if(mysqli_num_rows($resultL)>=1){
        $preStud = "";
        $preRating = "";

        if(mssql_num_rows($result)>=1){
            $arrStud = Array();
            $i=0;
            while($arrS = mssql_fetch_row($result)){

                $resultStat = mysqli_query($dbMain, "SELECT SUM(n26) FROM aerostat WHERE idLessons=".$_GET['idPredmet']." AND idStud=".$arrS[0]." AND nGroup<>'".$_GET['nGroup']."' GROUP BY idStud");
                if (mysqli_num_rows($resultStat) >= 1) { List($SumStat) = mysqli_fetch_row($resultStat); } else { $SumStat=0; }
                if($arrS[0] == $_GET['IdCaptain']){
                  $preStud .= "<div class='fio_student' data-idStudent='".$arrS[0]."' title='Капитан шлюпки'>".($i + 1).". <strong>".$arrS[1]."</strong>".($SumStat ? "<div class='SumStat' title='Отметки в других группах по текущей дисциплине'>".$SumStat."</div>" : "")."</div>\n";
                } else {
                  $preStud .= "<div class='fio_student' data-idStudent='".$arrS[0]."'>".($i + 1).". ".$arrS[1].($SumStat ? "<div class='SumStat' title='Отметки в других группах по текущей дисциплине'>".$SumStat."</div>" : "")."</div>\n";
                }

                $arrStud[$i]=$arrS[0];
                if(!$i){ $sqlStud="idStud=".$arrS[0].""; }else{ $sqlStud.=" OR idStud=".$arrS[0].""; }
                $i++;
            }
            $countarrStud = count($arrStud);

            if(mysqli_num_rows($resultL)>=1){
                while($arr = mysqli_fetch_row($resultL)){
                    $prepreRating = "";
                    switch($arr[2]){
                        case 1:
                            $prepreRating.="<div class='date_col colloquium_theme'>".($arr[4] ? "<div class='nLesson'>".$arr[4]."</div>" : "")."<div class='date_title' data-idLesson='".$arr[0]."'>".$arr[3]."</div>\n";
                            break;
                        case 2:
                            $prepreRating.="<div class='date_col exam_theme'>".($arr[4] ? "<div class='nLesson'>".$arr[4]."</div>" : "")."<div class='date_title' data-idLesson='".$arr[0]."'>".$arr[3]."</div>\n";
                            break;
                        default:
                            $prepreRating.="<div class='date_col'>".($arr[4] ? "<div class='nLesson'>".$arr[4]."</div>" : "")."<div class='date_title' data-idLesson='".$arr[0]."'>".$arr[3]."</div>\n";
                            break;
                    }
                    $resultS = mysqli_query($dbMain, "SELECT id, idStud, RatingO, pStatus, Nn FROM rating WHERE del=0 AND (".$sqlStud.") AND PKE=".$arr[2]." AND idLesson=".$arr[0]." AND idLessons=".$_GET['idPredmet']." AND PL=1");
                    $arrSStud = Array();
                    if(mysqli_num_rows($resultS)>=1){
                        $ii=0;
                        while($arrSS = mysqli_fetch_row($resultS)){
                            $arrSStud[$ii]=array($arrSS[0],$arrSS[1],$arrSS[2], $arrSS[3], $arrSS[4]);
                            $ii++;
                        }
                    }
                    mysqli_free_result($resultS);

                    $countSStud = count($arrSStud);
                    for($iS=0; $iS<=($countarrStud-1); $iS++){
                        $trueS=0;
                        for($iSS=0; $iSS<=($countSStud-1); $iSS++){
                            if($arrStud[$iS]==$arrSStud[$iSS][1]){
                                $prepreRating.="<div class='grade' data-idLes=".$arr[0]." data-idStudent=".$arrStud[$iS]." data-PKE=".$arr[2]." data-zapis=".$arrSStud[$iSS][0]." data-Status=".$arrSStud[$iSS][3]." data-Nn=".$arrSStud[$iSS][4].">".$arrSStud[$iSS][2]."</div>\n";
                                $trueS=1;
                            }
                        }
                        if(!$trueS){ $prepreRating.="<div class='grade' data-idLes=".$arr[0]." data-idStudent=".$arrStud[$iS]." data-PKE=".$arr[2]." data-zapis=0 data-Status=0 data-Nn=0></div>\n"; }
                    }

                    $preRating.=$prepreRating."</div>\n";
                }
            }

        }

        $retVal.=StudentViewL($preStud,$preRating);

    }else{
        if(mssql_num_rows($result)>=1){
            $preStud = "";
            $i=1;
            while($arrStud = mssql_fetch_row($result)){
                $resultStat = mysqli_query($dbMain, "SELECT SUM(n26) FROM aerostat WHERE idLessons=".$_GET['idPredmet']." AND idStud=".$arrStud[0]." AND nGroup<>'".$_GET['nGroup']."' GROUP BY idStud");
                if (mysqli_num_rows($resultStat) >= 1) { List($SumStat) = mysqli_fetch_row($resultStat); } else { $SumStat=0; }
                if($arrStud[0] == $_GET['IdCaptain']){
                  $preStud .= "<div class='fio_student' data-idStudent='".$arrStud[0]."' title='Капитан шлюпки'>".$i.". <strong>".$arrStud[1]."</strong>".($SumStat ? "<div class='SumStat' title='Отметки в других группах по текущей дисциплине'>".$SumStat."</div>" : "")."</div>\n";
                } else {
                  $preStud .= "<div class='fio_student' data-idStudent='".$arrStud[0]."'>".$i.". ".$arrStud[1].($SumStat ? "<div class='SumStat' title='Отметки в других группах по текущей дисциплине'>".$SumStat."</div>" : "")."</div>\n";
                }

                $i++;
            }
            $retVal.=StudentViewL($preStud);
        }
    }

    mssql_free_result($result);
    mysqli_free_result($resultL);


    echo HeaderFooterGroupL($retVal, "№ ".$_GET['nGroup'], $verC, $verS);



}



function GroupViewP(){
    include_once 'configStudent.php';
    include_once 'configMain.php';
    $retVal="<p>".$_SESSION['SesVar']['Dekan'][0]." (".$_SESSION['SesVar']['Dekan'][1].")</p>";

    $retVal .= "<h3><a href='d.php?v=a'>".$_GET['nPredmet']."</a><br>&nbsp;<font color='#ff0000'>&darr;</font><br>";
    $retVal .= "<a href='d.php?menuactiv=goF&idPrepod=".$_SESSION['SesVar']['FIO'][0]."&idPredmet=".$_GET['idPredmet']."&idF=".$_SESSION['SesVar']['Dekan'][2]."'>".$_GET['nF']."</a><br>&nbsp;<font color='#ff0000'>&darr;</font><br>";
    $retVal.="Группа № ".$_GET['nGroup']." (ПРАКТИЧЕСКОЕ / <a href='d.php?menuactiv=goG&idPrepod=".$_SESSION['SesVar']['FIO'][0]."&idPredmet=".$_GET['idPredmet']."&idF=".$_SESSION['SesVar']['Dekan'][2]."&idGroup=".$_GET['idGroup']."&PL=1&nPredmet=".$_GET['nPredmet']."&nF=".$_GET['nF']."&nGroup=".$_GET['nGroup']."&IdCaptain=".$_GET['IdCaptain']."'>Лекция</a>)</h3><hr>";


    $retVal.="
    <input type='hidden' id='idSubject' value='".$_GET['idPredmet']."'>
    <input type='hidden' id='nSubject' value='" . $_GET['nPredmet'] . "'>
    <input type='hidden' id='idPrepod' value='".$_GET['idPrepod']."'>
    <input type='hidden' id='idGroup' value='".$_GET['idGroup']."'>
    <input type='hidden' id='nGroup' value='".$_GET['nGroup']."'>
    <input type='hidden' id='idF' value='".$_SESSION['SesVar']['Dekan'][2]."'>
    <input type='hidden' id='idPL' value='0'>";

    $result = mssql_query("SELECT IdStud, CONCAT(Name_F,' ',Name_I,' ',Name_O) FROM dbo.Student WHERE IdGroup=".$_GET['idGroup']." AND IdStatus IS NULL ORDER BY Name_F",$dbStud);
    $resultL = mysqli_query($dbMain, "SELECT id, LDate, PKE, DATE_FORMAT(LDate,'%e.%m.%Y'), nLesson FROM lesson WHERE idGroup=".$_GET['idGroup']." AND idLessons=".$_GET['idPredmet']." AND PL=0 ORDER BY LDate,id");

    if(mysqli_num_rows($resultL)>=1){
        $preStud = "";
        $preRating = "";

        if(mssql_num_rows($result)>=1){
            $arrStud = Array();
            $i=0;
            while($arrS = mssql_fetch_row($result)){
                $resultStat = mysqli_query($dbMain, "SELECT SUM(n10+n11+n12+n13+n14+n15+n16+n17+n18+n19+n23+n24+n25+n28+n31+n32+n33+n34+n35+n36+n37+n40+n41+n42+n43+n44+n45) FROM aerostat WHERE idLessons=".$_GET['idPredmet']." AND idStud=".$arrS[0]." AND nGroup<>'".$_GET['nGroup']."' GROUP BY idStud");
                if (mysqli_num_rows($resultStat) >= 1) { List($SumStat) = mysqli_fetch_row($resultStat); } else { $SumStat=0; }
                if($arrS[0] == $_GET['IdCaptain']){
                  $preStud .= "<div class='fio_student' data-idStudent='".$arrS[0]."' title='Капитан шлюпки'>".($i + 1).". <strong>".$arrS[1]."</strong>".($SumStat ? "<div class='SumStat' title='Отметки в других группах по текущей дисциплине'>".$SumStat."</div>" : "")."</div>\n";
                } else {
                  $preStud .= "<div class='fio_student' data-idStudent='".$arrS[0]."'>".($i + 1).". ".$arrS[1].($SumStat ? "<div class='SumStat' title='Отметки в других группах по текущей дисциплине'>".$SumStat."</div>" : "")."</div>\n";
                }

                $arrStud[$i]=$arrS[0];
                if(!$i){ $sqlStud="idStud=".$arrS[0].""; }else{ $sqlStud.=" OR idStud=".$arrS[0].""; }
                $i++;
            }
            $countarrStud = count($arrStud);

            if(mysqli_num_rows($resultL)>=1){
                while($arr = mysqli_fetch_row($resultL)){
                    $prepreRating = "";
                    switch($arr[2]){
                        case 1:
                            $prepreRating.="<div class='date_col colloquium_theme'>".($arr[4] ? "<div class='nLesson'>".$arr[4]."</div>" : "")."<div class='date_title' data-idLesson='".$arr[0]."'>".$arr[3]."</div>\n";
                            break;
                        case 2:
                            $prepreRating.="<div class='date_col exam_theme'>".($arr[4] ? "<div class='nLesson'>".$arr[4]."</div>" : "")."<div class='date_title' data-idLesson='".$arr[0]."'>".$arr[3]."</div>\n";
                            break;
                        default:
                            $prepreRating.="<div class='date_col'>".($arr[4] ? "<div class='nLesson'>".$arr[4]."</div>" : "")."<div class='date_title' data-idLesson='".$arr[0]."'>".$arr[3]."</div>\n";
                            break;
                    }
                    $resultS = mysqli_query($dbMain, "SELECT id, idStud, RatingO, pStatus, Nn FROM rating WHERE del=0 AND (".$sqlStud.") AND PKE=".$arr[2]." AND idLesson=".$arr[0]." AND idLessons=".$_GET['idPredmet']." AND PL=0");
                    $arrSStud = Array();
                    if(mysqli_num_rows($resultS)>=1){
                        $ii=0;
                        while($arrSS = mysqli_fetch_row($resultS)){
                            $arrSStud[$ii]=array($arrSS[0],$arrSS[1],$arrSS[2], $arrSS[3], $arrSS[4]);
                            $ii++;
                        }
                    }
                    mysqli_free_result($resultS);

                    $countSStud = count($arrSStud);
                    for($iS=0; $iS<=($countarrStud-1); $iS++){
                        $trueS=0;
                        for($iSS=0; $iSS<=($countSStud-1); $iSS++){
                            if($arrStud[$iS]==$arrSStud[$iSS][1]){
                                $prepreRating.="<div class='grade' data-idLes=".$arr[0]." data-idStudent=".$arrStud[$iS]." data-PKE=".$arr[2]." data-zapis=".$arrSStud[$iSS][0]." data-Status=".$arrSStud[$iSS][3]." data-Nn=".$arrSStud[$iSS][4].">".$arrSStud[$iSS][2]."</div>\n";
                                $trueS=1;
                            }
                        }
                        if(!$trueS){ $prepreRating.="<div class='grade' data-idLes=".$arr[0]." data-idStudent=".$arrStud[$iS]." data-PKE=".$arr[2]." data-zapis=0 data-Status=0 data-Nn=0></div>\n"; }
                    }

                    $preRating.=$prepreRating."</div>\n";
                }
            }

        }

        $retVal.=StudentView($preStud,$preRating);

    }else{
        if(mssql_num_rows($result)>=1){
            $preStud = "";
            $i=1;
            while($arrStud = mssql_fetch_row($result)){
                $resultStat = mysqli_query($dbMain, "SELECT SUM(n10+n11+n12+n13+n14+n15+n16+n17+n18+n19+n23+n24+n25+n28+n31+n32+n33+n34+n35+n36+n37+n40+n41+n42+n43+n44+n45) FROM aerostat WHERE idLessons=".$_GET['idPredmet']." AND idStud=".$arrStud[0]." AND nGroup<>'".$_GET['nGroup']."' GROUP BY idStud");
                if (mysqli_num_rows($resultStat) >= 1) { List($SumStat) = mysqli_fetch_row($resultStat); } else { $SumStat=0; }
                if($arrStud[0] == $_GET['IdCaptain']){
                  $preStud .= "<div class='fio_student' data-idStudent='".$arrStud[0]."' title='Капитан шлюпки'>".$i.". <strong>".$arrStud[1]."</strong>".($SumStat ? "<div class='SumStat' title='Отметки в других группах по текущей дисциплине'>".$SumStat."</div>" : "")."</div>\n";
                } else {
                  $preStud .= "<div class='fio_student' data-idStudent='".$arrStud[0]."'>".$i.". ".$arrStud[1].($SumStat ? "<div class='SumStat' title='Отметки в других группах по текущей дисциплине'>".$SumStat."</div>" : "")."</div>\n";
                }

                $i++;
            }
            $retVal.=StudentView($preStud);
        }
    }

    mssql_free_result($result);
    mysqli_free_result($resultL);


    echo HeaderFooterGroup($retVal, "№ ".$_GET['nGroup'], $verC, $verS);

}




//----------------------------------------------------------------------------------------------



function Fakultet()
{
    include_once 'configStudent.php';
    include_once 'configMain.php';
    include_once 'config.php';

    $retVal = "<p>".$_SESSION['SesVar']['Dekan'][0]." (".$_SESSION['SesVar']['Dekan'][1].")</a></p>";

    $resPredmet = mysqli_query($dbMain, "SELECT name FROM lessons WHERE id=".$_GET['idPredmet']."");
    if (mysqli_num_rows($resPredmet) >= 1) {
        list($Pre) = mysqli_fetch_row($resPredmet);

        if ($_SESSION['SesVar']['Dekan'][2] == 233) {
            $rescourse = mysqli_query($dbMain, "SELECT course,id_faculty FROM schedule WHERE id_lesson=".$_GET['idPredmet']);
        } else {
            $rescourse = mysqli_query($dbMain, "SELECT course FROM schedule WHERE id_lesson=".$_GET['idPredmet']." AND id_faculty=".$_SESSION['SesVar']['Dekan'][2]);
        }
        if (mysqli_num_rows($rescourse) >= 1) {
            if ($_SESSION['SesVar']['Dekan'][2] == 283) {
                $i = 0;
                while (list($arrS) = mysqli_fetch_row($rescourse)) {
                    if (!$i) {
                        $sqlSr = "SUBSTRING(Name,2,1)='".$arrS."'";
                        $sqlS = "LEFT(Name,2)='".$fac[$_SESSION['SesVar']['Dekan'][2]][0].$arrS."'";
                        $sqlSS = "LEFT(Name,2)='".$fac[$_SESSION['SesVar']['Dekan'][2]][2].$arrS."'";
                        $i=1;
                    } else {
                        $sqlSr.=" OR SUBSTRING(Name,2,1)='".$arrS."'";
                        $sqlS.=" OR LEFT(Name,2)='".$fac[$_SESSION['SesVar']['Dekan'][2]][0].$arrS."'";
                        $sqlSS.=" OR LEFT(Name,2)='".$fac[$_SESSION['SesVar']['Dekan'][2]][2].$arrS."'";
                    }
                }
                $sqlSO="((IdF=".$_SESSION['SesVar']['Dekan'][2]." AND (".$sqlSr.") AND DATEDIFF(month,CONCAT(Year,'0101'),GETDATE())<".$fac[$_SESSION['SesVar']['Dekan'][2]][1]." AND LEN(Name)>=4) OR ((".$sqlS.") AND DATEDIFF(month,CONCAT(Year,'0101'),GETDATE())<".$fac[$_SESSION['SesVar']['Dekan'][2]][1]." AND LEN(Name)>=4)) AND ((IdF=".$_SESSION['SesVar']['Dekan'][2]." AND (".$sqlSr.") AND DATEDIFF(month,CONCAT(Year,'0101'),GETDATE())<".$fac[$_SESSION['SesVar']['Dekan'][2]][3]." AND LEN(Name)>=4) OR ((".$sqlSS.") AND DATEDIFF(month,CONCAT(Year,'0101'),GETDATE())<".$fac[$_SESSION['SesVar']['Dekan'][2]][3]." AND LEN(Name)>=4))";
            } else if($_SESSION['SesVar']['Dekan'][2] == 233){
                $i = 0;
                while ($arrS = mysqli_fetch_row($rescourse)) {
                    if (!$i) {
                        $sqlS = "LEFT(Name,2)='".$fac[$arrS[1]][0].$arrS[0]."'";
                        $i=1;
                    } else {
                        $sqlS.=" OR LEFT(Name,2)='".$fac[$arrS[1]][0].$arrS[0]."'";
                    }
                }
                $sqlSO="(IdF=".$_SESSION['SesVar']['Dekan'][2]." AND (".$sqlS.") AND DATEDIFF(month,CONCAT(Year,'0101'),GETDATE())<".$fac[$_SESSION['SesVar']['Dekan'][2]][1]." AND LEN(Name)>=4)";
            } else {
                $i = 0;
                while (list($arrS) = mysqli_fetch_row($rescourse)) {
                    if (!$i) {
                        $sqlSr = "SUBSTRING(Name,2,1)='".$arrS."'";
                        $sqlS = "LEFT(Name,2)='".$fac[$_SESSION['SesVar']['Dekan'][2]][0].$arrS."'";
                        $i=1;
                    } else {
                        $sqlSr.=" OR SUBSTRING(Name,2,1)='".$arrS."'";
                        $sqlS.=" OR LEFT(Name,2)='".$fac[$_SESSION['SesVar']['Dekan'][2]][0].$arrS."'";
                    }
                }
                $sqlSO="(IdF=".$_SESSION['SesVar']['Dekan'][2]." AND (".$sqlSr.") AND DATEDIFF(month,CONCAT(Year,'0101'),GETDATE())<".$fac[$_SESSION['SesVar']['Dekan'][2]][1]." AND LEN(Name)>=4) OR ((".$sqlS.") AND DATEDIFF(month,CONCAT(Year,'0101'),GETDATE())<".$fac[$_SESSION['SesVar']['Dekan'][2]][1]." AND LEN(Name)>=4)";
            }
        } else {
            if ($_SESSION['SesVar']['Dekan'][2] == 283) {
                $sqlSO="((IdF=".$_SESSION['SesVar']['Dekan'][2]." AND DATEDIFF(month,CONCAT(Year,'0101'),GETDATE())<".$fac[$_SESSION['SesVar']['Dekan'][2]][1]." AND LEN(Name)>=4) OR (LEFT(Name,1)='".$fac[$_SESSION['SesVar']['Dekan'][2]][0]."' AND DATEDIFF(month,CONCAT(Year,'0101'),GETDATE())<".$fac[$_SESSION['SesVar']['Dekan'][2]][1]." AND LEN(Name)>=4)) AND ((IdF=".$_SESSION['SesVar']['Dekan'][2]." AND DATEDIFF(month,CONCAT(Year,'0101'),GETDATE())<".$fac[$_SESSION['SesVar']['Dekan'][2]][3]." AND LEN(Name)>=4) OR (LEFT(Name,1)='".$fac[$_SESSION['SesVar']['Dekan'][2]][2]."' AND DATEDIFF(month,CONCAT(Year,'0101'),GETDATE())<".$fac[$_SESSION['SesVar']['Dekan'][2]][3]." AND LEN(Name)>=4))";
            } else {
                $sqlSO="(IdF=".$_SESSION['SesVar']['Dekan'][2]." AND DATEDIFF(month,CONCAT(Year,'0101'),GETDATE())<".$fac[$_SESSION['SesVar']['Dekan'][2]][1]." AND LEN(Name)>=4) OR (LEFT(Name,1)='".$fac[$_SESSION['SesVar']['Dekan'][2]][0]."' AND DATEDIFF(month,CONCAT(Year,'0101'),GETDATE())<".$fac[$_SESSION['SesVar']['Dekan'][2]][1]." AND LEN(Name)>=4)";
            }
        }

        $retVal .= "<h3><a href='d.php?v=a'>$Pre</a><br>&nbsp;<font color='#ff0000'>&darr;</font><br>";
        $result = mssql_query("SELECT Name FROM dbo.Facultets WHERE IdF=".$_SESSION['SesVar']['Dekan'][2]."", $dbStud);
        if (mssql_num_rows($result) >= 1) {
            list($idName) = mssql_fetch_row($result);
            $retVal .= "$idName</h3><hr>".FormSearch();


            $retVal .= "
      <div class='DialogP'>
      <div class='titleBox'><H2>Группы</H2></div>
      ";
            $result = mssql_query("SELECT IdGroup, Name, IIF(IdCaptain!=null, IdCaptain, 0), IIF(IdF != ".$_SESSION['SesVar']['Dekan'][2].", 1, 0) FROM dbo.Groups WHERE ".$sqlSO." ORDER BY Name", $dbStud);
            if (mssql_num_rows($result) >= 1) {
                $preChar = "";
                while ($arr = mssql_fetch_row($result)) {
                    if ($preChar != substr($arr[1], 0, 2)) $retVal .= "<div class='HRnext'></div>";
                    $preChar = substr($arr[1], 0, 2);
                    $retVal .= "<div class='DialogGr'><strong>" . $arr[1] . "</strong>".($arr[3] ? "<div class='Inostr' title='Группа иностранных учащихся'>и</div>" : "")."<div class='GroupPL'>";
                    $retVal.="<a href='d.php?menuactiv=goG&idPrepod=".$_SESSION['SesVar']['FIO'][0]."&idPredmet=".$_GET['idPredmet']."&idF=".$_SESSION['SesVar']['Dekan'][2]."&idGroup=".$arr[0]."&PL=0&nPredmet=".$Pre."&nF=".$idName."&nGroup=".$arr[1]."&IdCaptain=".$arr[2]."'>Практ.</a>&nbsp;&nbsp;&nbsp;";
                    $retVal.="<a href='d.php?menuactiv=goG&idPrepod=".$_SESSION['SesVar']['FIO'][0]."&idPredmet=".$_GET['idPredmet']."&idF=".$_SESSION['SesVar']['Dekan'][2]."&idGroup=".$arr[0]."&PL=1&nPredmet=".$Pre."&nF=".$idName."&nGroup=".$arr[1]."&IdCaptain=".$arr[2]."'>Лекция</a>";
                    $retVal .= "</div></div></div>\n";
                }
            }

            $retVal .= "</div>";

        }
    }

    unset($sqlSO, $sqlS, $sqlSr, $sqlSS);
    mssql_free_result($result);
    mysqli_free_result($resPredmet);

    echo HeaderFooter($retVal, $_SESSION['SesVar']['Dekan'][0]." (".$_SESSION['SesVar']['Dekan'][1].")", $verC);
}

//----------------------------------------------------------------------------------------------


function MainF(){
    $retVal="<p>".$_SESSION['SesVar']['Dekan'][0]." (".$_SESSION['SesVar']['Dekan'][1].")</p><hr>".FormSearch();

    $countPredmet=count($_SESSION['SesVar']['PredmetDekan']);
    $retVal.="
      <div class='DialogP'>
      <div class='titleBox'><H2><a href='d.php'>По курсам</a>&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;По дисциплинам</H2></div>
   ";

    include_once 'configStudent.php';

    for($ii=0; $ii<=($countPredmet-1); $ii++){
        $retVal.="<div class='DialogFakFak'><a href='d.php?menuactiv=goF&idPrepod=".$_SESSION['SesVar']['FIO'][0]."&idPredmet=".$_SESSION['SesVar']['PredmetDekan'][$ii][0]."&idF=".$_SESSION['SesVar']['Dekan'][2]."'>".$_SESSION['SesVar']['PredmetDekan'][$ii][1]."</a>";
        $retVal.="</div>\n";
    }
    $retVal.="</div>\n";
    echo HeaderFooter($retVal, $_SESSION['SesVar']['Dekan'][0]." (".$_SESSION['SesVar']['Dekan'][1].")", $verC);
}


//----------------------------------------------------------------------------------------------

function HeaderFooterSearch($content,$title,$vC='',$vS=''){
    ?>
    <!doctype html>
    <html>
    <head>
        <title><?php echo $title; ?></title>
        <meta charset="windows-1251">
        <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <link rel="shortcut icon" href="img/favicon.ico" type="image/x-icon">
        <link rel="stylesheet" href="style.css<?php echo $vC; ?>">
        <link rel="stylesheet" href="scripts/jquery-ui.css">
        <script src="scripts/jquery-3.2.1.min.js"></script>
        <script src="scripts/jquery-ui.js"></script>
        <script src="scripts/online.js"></script>
        <script src="scripts/corporate.js<?php echo $vS; ?>"></script>
        <script src="scripts/viewGrade.js<?php echo $vS; ?>"></script>
    </head>
    <body>
    <?
    //<div class="Exit"><a href="index.php?go=exit" title="Выхожу">Выхожу</a></div>
    echo LevelView();
    ?>
    <div class="Header"><H2><?php echo $_SESSION['SesVar']['FIO'][1]; ?></H2></div>
    <p><?php echo $title; ?></p><a href='d.php'>&larr; вернуться</a><?php echo FormSearch(); ?>
    <?php echo $content; ?>
    <div style="clear:both;">&nbsp;</div>
    <div class="support"><a href="help/index.html">Руководство пользователя "Эл. журнала"</a> <br> По техническим вопросам работы электронного журнала обращаться: 279-42-05 (вн. 506) </div>
    <div style="clear:both; margin-bottom:100px;">&nbsp;</div>

    <div id='form-update' title='Заменить пропуски'>
        <form>
            <fieldset>
                <div class='panel'>
                    <b id='1' class='tool' title='Пропуск по уважительной причине'><b>Н<sub>у</sub></b></b><span class='space'></span>
                    <b id='3' class='tool' title='Пропуск без отработки занятия'><b>Н<sub>б.о</sub></b></b><span class='space'></span>
                    <b id='2' class='tool' title='Пропуск по неуважительной причине'><b>Н<sub>н</sub></b></b>
                    <br><br>

                    <input class='inp_cell' id='inp_0' type=text maxlength='0'
                           onkeydown='return proverka(event,0);' onblur='return proverka(event,0);'>

                    <br><br>
            </fieldset>
            <hr class='marg-line'>
            <button id='close' class='attention'>Отмена</button>
            <button id='updateAbs' class='button'>Заменить</button>
        </form>
    </div>

    <div id='form-make-pay' title='Оплата'>
        <span>Вы действительно хотите сделать выбранные пропуски оплаченными?</span>
    </div>

    </body>
    </html>
    <?php
}


function HeaderFooter($content,$title,$vC='',$vS=''){
    ?>
    <!doctype html>
    <html>
    <head>
        <title><?php echo $title; ?></title>
        <meta charset="windows-1251">
        <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <link rel="shortcut icon" href="img/favicon.ico" type="image/x-icon">
        <link rel="stylesheet" href="style.css<?php echo $vC; ?>">
        <script src="scripts/jquery-3.2.1.min.js"></script>
        <script src="scripts/online.js"></script>
    </head>
    <body>
    <?
    //<div class="Exit"><a href="index.php?go=exit" title="Выхожу">Выхожу</a></div>
    echo LevelView();
    ?>
    <div class="Header"><H2><?php echo $_SESSION['SesVar']['FIO'][1]; ?></H2></div>
    <?php echo $content; ?>
    <div style="clear:both;">&nbsp;</div>
    <div class="support"><a href="help/index.html">Руководство пользователя "Эл. журнала"</a> <br> По техническим вопросам работы электронного журнала обращаться: 279-42-05 (вн. 506) </div>
    <div style="clear:both; margin-bottom:100px;">&nbsp;</div>
    </body>
    </html>
    <?php
}


function HeaderFooterKurs($content,$title,$vC='',$vS=''){
    ?>
    <!doctype html>
    <html>
    <head>
        <title><?php echo $title; ?></title>
        <meta charset="windows-1251">
        <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <link rel="shortcut icon" href="img/favicon.ico" type="image/x-icon">
        <link rel="stylesheet" href="style.css<?php echo $vC; ?>">
        <link rel="stylesheet" href="scripts/jquery-ui.css">
        <script src="scripts/jquery-3.2.1.min.js"></script>
        <script src="scripts/jquery-ui.js"></script>
        <script src="scripts/jquery.datepicker.extension.range.min.js"></script>
        <script src="scripts/kursInfo.js<?php echo $vS; ?>"></script>
        <script src="scripts/online.js"></script>
    </head>
    <body>
    <?
    echo LevelView();
    ?>
    <div class="Header"><H2><?php echo $_SESSION['SesVar']['FIO'][1]; ?></H2></div>
    <?php echo $content; ?>
    <div style="clear:both;">&nbsp;</div>
    <div class="support"><a href="help/index.html">Руководство пользователя "Эл. журнала"</a> <br> По техническим вопросам работы электронного журнала обращаться: 279-42-05 (вн. 506) </div>
    <div style="clear:both; margin-bottom:100px;">&nbsp;</div>

    <div id='diapasonRep' title='Заменить пропуски'>
        <form>
            <fieldset>
              c <input id="from_date" readonly> по <input id="to_date" readonly><br><br>
                <div class='panel'>
                    <b  class='tool' title='Пропуск по уважительной причине'><b>Н<sub>у</sub></b></b><span class='space'></span>
                    <b  class='tool' title='Пропуск без отработки занятия'><b>Н<sub>б.о</sub></b></b><span class='space'></span>
                    <b  class='tool' title='Пропуск по неуважительной причине'><b>Н<sub>н</sub></b></b>
                </div>
                <br>
                <input class='inp_cell' id='inp_0' type=text maxlength='0'>
                <br>
            </fieldset>
        </form>
    </div>

    </body>
    </html>
    <?php
}


function HeaderFooterGroup($content,$title,$vC='',$vS=''){
    ?>

    <!doctype html>
    <html>
    <head>
        <title><?php echo $title; ?></title>
        <meta charset="windows-1251">
        <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <link rel="shortcut icon" href="img/favicon.ico" type="image/x-icon">
        <link rel="stylesheet" href="style.css<?php echo $vC; ?>">
        <link rel="stylesheet" href="scripts/jquery-ui.css">
        <script src="scripts/jquery-3.2.1.min.js"></script>
        <script src="scripts/jquery-ui.js"></script>
        <script src="scripts/jquery.mask.js"></script>
        <script src="scripts/scriptDec.js<?php echo $vS; ?>"></script>
        <script src="scripts/online.js"></script>
        <script src="scripts/corporate.js<?php echo $vS; ?>"></script>
    </head>
    <body>
    <?php echo LevelView(); ?>
    <div class="Header"><H2><?php echo $_SESSION['SesVar']['FIO'][1]; ?></H2></div>
    <?php echo $content; ?>
    <div style="clear:both;">&nbsp;</div>
    <div class="export">
        <a href="#" title="Экспортировать в Excel"><img src="img/csv.png"></a>
    </div>
    <div class="support"><a href="help/index.html">Руководство пользователя "Эл. журнала"</a> <br> По техническим вопросам работы электронного журнала обращаться: 279-42-05 (вн. 506) </div>
    <div style="clear:both; margin-bottom:100px;">&nbsp;</div>
    </body>
    </html>
    <?php
}


function HeaderFooterGroupL($content,$title,$vC='',$vS=''){
    ?>

    <!doctype html>
    <head>
        <title><?php echo $title; ?></title>
        <meta charset="windows-1251">
        <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <link rel="shortcut icon" href="img/favicon.ico" type="image/x-icon">
        <link rel="stylesheet" href="style.css<?php echo $vC; ?>">
        <link rel="stylesheet" href="scripts/jquery-ui.css">
        <script src="scripts/jquery-3.2.1.min.js"></script>
        <script src="scripts/jquery-ui.js"></script>
        <script src="scripts/jquery.mask.js"></script>
        <script src="scripts/scriptDecLec.js<?php echo $vS; ?>"></script>
        <script src="scripts/online.js"></script>
        <script src="scripts/corporate.js<?php echo $vS; ?>"></script>
    </head>
    <body>
    <?php echo LevelView(); ?>
    <div class="Header"><H2><?php echo $_SESSION['SesVar']['FIO'][1]; ?></H2></div>
    <?php echo $content; ?>
    <div style="clear:both;">&nbsp;</div>
    <div class="export">
        <a href="#" title="Экспортировать в Excel"><img src="img/csv.png"></a>
    </div>
    <div class="support"><a href="help/index.html">Руководство пользователя "Эл. журнала"</a> <br> По техническим вопросам работы электронного журнала обращаться: 279-42-05 (вн. 506) </div>
    <div style="clear:both; margin-bottom:100px;">&nbsp;</div>
    </body>
    </html>
    <?php
}



//----------------------------------------------------------------------------------------------

function StudentView($content,$contentO=''){
    $ret="<div id='form-edit' title='Редактировать отметку'>
    <form id='form-edit'>
        <fieldset>
            <div class='panel'>
                    <b id='1' class='tool'  title='Пропуск по уважительной причине'><b>Н<sub>у</sub></b></b>
                    <span class='space'></span>
                    <b id='3' class='tool'  title='Пропуск без отработки занятия'><b>Н<sub>б.о</sub></b></b>
                    <span class='space'></span>
                    <b id='2' class='tool'  title='Пропуск по неуважительной причине'><b>Н<sub>н</sub></b></b>
                <br><br>

                <input class='inp_cell' id=\"inp_0\" type=text maxlength='6' autocomplete='off'
                       onkeydown=\"return proverka(event,0);\">
                <input class='inp_cell' id=\"inp_1\" type='text' maxlength='6' autocomplete='off'
                       onkeydown=\"return proverka(event,1);\">
                <input class='inp_cell' id=\"inp_2\" type='text' maxlength='6' autocomplete='off'
                       onkeydown=\"return proverka(event,2);\">

                <br><br>
        </fieldset>
                <hr class='marg-line'>
                <button id='close' class='attention'>Отмена</button>
                <button id='edit' class='button'>Сохранить</button>
              
            </div>
        
    </form>
</div>

 <div class='popup-content' id='history'>
     <span id='log_text'></span>
    </div>

<div id='form-show' title='Отметки в других группах'>
    <form>
   <h3 id='sub'></h3>
   <h2 id='fio'></h2>
      <div id='content'></div>
    </form>
</div>

<div id='form-make-pay' title='Оплата'>
   <span>Вы действительно хотите сделать выбранные пропуски оплаченными?</span>
</div>

<div class='container-list'>
    <div class='container'>
        <div class='fio'>
            <div class='title'>ФИО</div>\n".$content."
        </div>

        <div class='result_box'><div class='date_col hidden'></div>".$contentO."</div><div class='statistic'></div>
    </div>
</div>";

    return $ret;
}



//----------------------------------------------------------------------------------------------



function StudentViewL($content,$contentO=''){
    $ret="<div id='form-edit' title='Редактирование отметки'>
    <form id='form-edit'>
        <fieldset>
            <div class='panel'>
                <b id='1' class='tool' title='Пропуск по уважительной причине'><b>Н<sub>у</sub></b></b>
                <span class='space'></span>
                <b id='3' class='tool' Пропуск без отработки занятия><b>Н<sub>б.о</sub></b></b>
                <span class='space'></span>
                <b id='2' class='tool' title='Пропуск по неуважительной причине'><b>Н<sub>н</sub></b></b>
 
                <br><br>


                <input class='inp_cell' id=\"inp_0\" type=text maxlength='6' autocomplete='off'
                       onkeydown=\"return proverka(event,0);\">

                <br><br>
        </fieldset>
                <hr class='marg-line'>
                <button id='close' class='attention'>Отмена</button>
                <button id='edit' class='button'>Сохранить</button>
               
            </div>

    </form>
</div>

 <div class='popup-content' id='history'>
       <span id='log_text'></span>
    </div> 

<div id='form-show' title='Отметки в других группах'>
    <form>
   <h3 id='sub'></h3>
   <h2 id='fio'></h2>
      <div id='content'></div>
    </form>
</div>

<div id='form-make-pay' title='Оплата'>
   <span>Вы действительно хотите сделать выбранные пропуски оплаченными?</span>
</div>

<div class='container-list'>

    <div class='container'>
        <div class='fio'>
            <div class='title'>ФИО</div>\n".$content."
        </div>

        <div class='result_box'><div class='date_col hidden'></div>".$contentO."

        </div><div class='statistic'></div>
    </div>
</div>";

    return $ret;
}

function LevelView(){
    $countLev=count($_SESSION['SesVar']['Level']);
    $preDiv='';
    if($countLev>=2){
        for($ii=0; $ii<=($countLev-1); $ii++){
            switch($_SESSION['SesVar']['Level'][$ii]){
                case 1:
                    $preDiv.="<p><a href='r.php'><strong>".$_SESSION['SesVar']['Rector'][0]."</strong> (".$_SESSION['SesVar']['Rector'][1].")</a></p>";
                    break;
                case 3:
                    $preDiv.="<p><a href='p.php'><strong>".$_SESSION['SesVar']['Prepod'][0]."</strong> (".$_SESSION['SesVar']['Prepod'][1].")</a></p>";
                    break;
                case 4:
                    $preDiv.="<p><a href='z.php'><strong>".$_SESSION['SesVar']['Zav'][0]."</strong> (".$_SESSION['SesVar']['Zav'][1].")</a></p>";
                    break;
            }
        }
    }
    return "<div class='Exit'>".$preDiv."<a href='exit.php'><H2>Выход</H2></a></div><div class='C'></div>";
}

function FormSearch($wrd=''){

return "<div class='SearchForm'><form action='d.php'>
<input type=hidden name='menuactiv' value='SearchStudent'>
<div>Поиск студента по фамилии или номеру зачётки</div>
<input name='Swords' type='search' class='SearchWords' maxlength=100 value='".$wrd."'><input type='submit' value='Найти'>
</form></div>";

}
?>