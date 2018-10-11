<?php

chdir('/www/ej.bsmu.by/cron');
include_once '../configMain.php';

$res = mysqli_query($dbMain, "SELECT id, RatingO, idLessons, idLesson, DateO, TimeO, idEmployess, idStud, nGroup FROM rating WHERE (del=0) AND (RatingO LIKE '3%' OR RatingO LIKE '__3%' OR RatingO LIKE '____3%' OR RatingO LIKE '4%' OR RatingO LIKE '__4%' OR RatingO LIKE '____4%' OR RatingO LIKE '26%' OR RatingO LIKE '__26%' OR RatingO LIKE '____26') ORDER BY DateO, TimeO");
if (mysqli_num_rows($res)>=1) {
   while ($arr = mysqli_fetch_row($res)) {
      $arrTo = ExpImp($arr[1]);
      mysqli_query($dbMain, "INSERT INTO logi (idRating,idLessons,idLesson,idStud,DateO,TimeO,RatingO,idEmployess) VALUES (".$arr[0].",".$arr[2].",".$arr[3].",".$arr[7].",'".$arr[4]."','".$arr[5]."',".$arr[1].",".$arr[6].")");      
      mysqli_query($dbMain, "UPDATE rating SET DateO=CURDATE(), TimeO=CURTIME(), RatingO=".$arrTo[0].", idEmployess=1, levEmployess=2 WHERE del=0 AND id=".$arr[0]." AND idStud=".$arr[7]);
      mysqli_query($dbMain, "UPDATE aerostat SET n21=n21+".$arrTo[1]." WHERE idStud=".$arr[7]." AND idLessons=".$arr[2]." AND nGroup='".$arr[8]."'");
   }
   unset($arr);
   mysqli_free_result($res);
}

// SELECT RatingO FROM rating WHERE del=0 AND (RatingO LIKE '3%' OR RatingO LIKE '__3%' OR RatingO LIKE '____3%' OR RatingO LIKE '4%' OR RatingO LIKE '__4%' OR RatingO LIKE '____4%' OR RatingO LIKE '26%' OR RatingO LIKE '__26%' OR RatingO LIKE '____26') GROUP BY RatingO

function ExpImp($ei)
{
   $ar=str_split($ei, 2);
   $arcount = count($ar);
   $NNcount = 0;
   for($iS=0; $iS<=($arcount-1); $iS++){ if($ar[$iS]==26 || ($ar[$iS]>=31 && $ar[$iS]<=37) || ($ar[$iS]>=40 && $ar[$iS]<=45)){ $ar[$iS]=21; $NNcount++; } }
   return Array(implode("", $ar),$NNcount);
}
?>
