<?php

include 'posts.php';

$result = getNotifications((int)$_POST['USER_ID']);
if (is_array($result)) {
    foreach ($result as $row) {
        echo ($row['NOTIFICATION_TEXT']."|");
    }
} else {
    echo 'Failed. SQL related Error.';
}