<?php

include 'images.php';

$userID = $_REQUEST['USR_ID'];
$imagePath = __DIR__."/../images/profile_images/profile_image_".$userID.".png";
saveImage($_REQUEST['USR_IMG'], $imagePath);
