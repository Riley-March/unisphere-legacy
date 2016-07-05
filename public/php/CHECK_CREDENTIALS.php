<?php

include 'user.php';

$result = checkCredentials($_POST['USER_EMAIL'], (int)$_POST['USER_KEY']);
if ($result) {
    echo "Success. Logged In. |" . $result['USER_ID'] . "^" . $result['USER_NAME'] . "^" .
        $result['USER_DESCRIPTION'] . "^" . $result['USER_ALIAS'];
} else {
    echo "Failed.";
}
