<?php

include 'vote.php';

if(addVote((int)$_POST[POST_ID], $_POST[USER], "post")) {
    echo 'Success';
} else {
    echo 'Failed';
}
