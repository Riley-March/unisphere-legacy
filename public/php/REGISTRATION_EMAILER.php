<?php

$userName = $_POST["USER_NAME"]; // USER_NAME is optional
$userEmail = $_POST["USER_EMAIL"];
$userKey = $_POST["USER_KEY"];
$requestType = $_POST["TYPE"]; // must be either 'new' or 'update'

$senderName = "Unisphere Support";
$senderEmail = "unisphere.keys@gmail.com";
$headers = "From: $senderName <$senderEmail>\r\n"; // . "Reply-To: $senderEmail";

$subject = "";
$message = "";

if($userEmail == "" || $userKey == "") {
	echo "Failed. Missing parameters.";
	return;
}

if($requestType == "new") {
	$subject = "Unisphere - Confirm Account";
	$message = "Hi $userName, \n\n" // $userName is optional (can be empty string)
	. "Welcome to Unisphere! Please find your login key below: \n\n" 
	. "Key: $userKey \n\n" 
	. "Thank-you for your support. \nThe Unisphere Team.";
	echo "Success.";
} else if($requestType == "update") {
	$subject = "Unisphere - Your New Key";
	$message = "Hi $userName, \n\n" // $userName is optional (can be empty string)
	. "Your Unisphere login key has been changed. Please find your new key below: \n\n" 
	. "Key: $userKey \n\n" 
	. "Thank-you for your support. \nThe Unisphere Team.";
	echo "Success.";
} else {
	echo "Failed. Type wasn't specified.";
	return;
}

// In case any of our lines are larger than 70 characters, we should use wordwrap()
//$message = wordwrap($message, 70, "\r\n");

// Send
// mail(recipient, subject, message, headers);
mail($userEmail, $subject, $message, $headers);
?>