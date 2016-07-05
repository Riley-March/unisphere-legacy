<?php

function saveImage($image, $path) {
	echo $path;
	$image = str_replace(' ','+',$image);
    $imageBin = base64_decode($image);
	echo '1';
	header('Content-Type: bitmap; charset=utf-8');
	echo '100_';
    $imageFile = fopen($path, "wb");
	echo '2';
    fwrite($imageFile, $imageBin);
	echo '3';
    fclose($imageFile);
}
