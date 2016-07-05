<?php

include 'posts.php';

if (postEvent($_POST[USER_NAME], (int)$_POST[USER_ID], $_POST[EVENT_NAME], $_POST[EVENT_DESCR], $_POST[EVENT_TIME], $_POST[FRAG])) {
    echo 'Success';
} else {
    echo 'Failed';
}
