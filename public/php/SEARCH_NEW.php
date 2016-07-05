<?php

include 'search.php';

$result = searchNew($_POST['SEARCH_TEXT'], $_POST['USER'], $_POST['EMAIL_FRAG'],
    (int)$_POST['GET_START'], (int)$_POST['GET_MAX']);
if (is_string($result)) {
    echo $result;
} else {
    echo "Failed. SQL related Error.";
}
