<?php

include 'user.php';

$result = updateKey($_POST['USER_EMAIL'], (int)$_POST['USER_KEY_O'], (int)$_POST['USER_KEY_N']);
if ($result[0]) {
    echo "Success.";
} else {
    echo "Failed: ".$result[1];
}
