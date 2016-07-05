<?php

include 'user.php';

if (updateUser($_POST['USER_EMAIL'], $_POST['USER_NAME'], $_POST['USER_ALIAS'],
    $_POST['USER_DESC'], $_REQUEST['USER_IMG'], (int)$_POST['USER_ID'])) {
    echo "Success.";
} else {
    echo "Failed.";
}
