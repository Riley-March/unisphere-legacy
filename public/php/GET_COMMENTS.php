<?php

include 'posts.php';

$result = getComments((int)$_POST['POST_ID'], $_POST['COM_TYPE']);
if (is_array($result)) {
    foreach ($result as $row) {
        echo ($row['COM_USER'] . "^" . $row['COM_TXT']  . "^" . $row['COM_TIME'] . "^" . $row['USER_ID'] . "|");
    }
} else {
    echo 'Failed. SQL related Error.';
}
