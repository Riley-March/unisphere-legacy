<?php

include 'user.php';

$result = userInsert($_POST['USER_EMAIL'], $_POST['USER_NAME'], (int)$_POST['USER_KEY'], $_POST['USER_FRAG'],
    $_POST['USR_ALIAS'], $_POST['USR_DESC'], $_REQUEST['USR_IMG']);
if ($result[0]) {
    echo "Success.";
} else {
    echo "Failed: ".$result[1];
}
