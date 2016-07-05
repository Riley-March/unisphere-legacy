<?php

include 'posts.php';
if (postReport($_POST[REP_NAME], (int)$_POST[REP_ID], $_POST[USER_NAME], (int)$_POST[USER_ID], $_POST[REP_TXT])) {
    echo 'Success';
} else {
    echo 'Failed';
}
