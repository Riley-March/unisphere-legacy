<?php

include 'db_interface.php';

function addVote($id, $user, $voteType) {
    if (!empty($id) and !empty($user) and in_array($voteType, array("post", "user", "event"))) {
        if ($voteType == "post") {
            $table = "UNI_VOTES_P";
            $idType = "POST_ID";
        } else if ($voteType == "user") {
            $table = "UNI_VOTES";
            $idType = "USER_ID";
        } else if ($voteType == "event") {
            $table = "UNI_VOTES_E";
            $idType = "EVENT_ID";
        }

        // Delete first... is this needed, since the next statement adds it right back?
        $stmt = DBIface::connect()->prepare("DELETE FROM ".$table." WHERE ".$idType."=:ID AND USER_EMAIL=:user");
        $stmt->bindValue(":ID", $id, PDO::PARAM_INT);
        $stmt->bindValue(":user", $user, PDO::PARAM_STR);
        $stmt->execute();

        $stmt = DBIface::connect()->prepare("INSERT INTO ".$table." (".$idType.", USER_EMAIL) VALUES(:ID, :user)");
        $stmt->bindValue(":ID", $id, PDO::PARAM_INT);
        $stmt->bindValue(":user", $user, PDO::PARAM_STR);
        return $stmt->execute();
    }
    return false;
}

function removeVote($id, $user, $voteType) {
    if (!empty($id) and !empty($user) and in_array($voteType, array("post", "user", "event"))) {
        if ($voteType == "post") {
            $table = "UNI_VOTES_P";
            $idType = "POST_ID";
        } else if ($voteType == "user") {
            $table = "UNI_VOTES";
            $idType = "USER_ID";
        } else if ($voteType == "event") {
            $table = "UNI_VOTES_E";
            $idType = "EVENT_ID";
        }
        $stmt = DBIface::connect()->prepare("DELETE FROM ".$table." WHERE ".$idType."=:ID AND USER_EMAIL=:user");
        $stmt->bindValue(":ID", $id, PDO::PARAM_INT);
        $stmt->bindValue(":user", $user, PDO::PARAM_STR);
        return $stmt->execute();
    }
    return false;
}
