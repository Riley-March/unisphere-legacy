<?php

include 'posts.php';

if (postPublish($_POST["POST_USER"], $_POST["POST_EMAIL"], $_POST["POST_TEXT"], $_POST["POST_FRAG"], $_POST['image'], $_POST['USER_ID'])) {
    echo "Success";
} else {
    echo "Failed. SQL related Error.";
}
