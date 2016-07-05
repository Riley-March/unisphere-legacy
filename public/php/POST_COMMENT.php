<?php

include 'posts.php';
if (postComment((int)$_POST[POST_ID], $_POST[USER_NAME], $_POST[COMMENT_TEXT], $_POST[COM_TYPE], (int)$_POST[USER_ID])) {
    echo 'Success';
} else {
    echo 'Failed';
}
