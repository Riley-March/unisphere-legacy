<?php

include 'db_interface.php';
include 'images.php';

function checkCredentials($email, $PIN) {
    if (!empty($email) and !empty($PIN)) {
        $stmt = DBIface::connect()->prepare("SELECT * FROM UNI_USERS WHERE USER_EMAIL=:email AND USER_KEYPIN=:PIN");
        $stmt->bindValue(":email", $email, PDO::PARAM_STR);
        $stmt->bindValue(":PIN", $PIN, PDO::PARAM_INT);
        if ($stmt->execute()) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                // Activate account
                $stmt = DBIface::connect()->prepare("UPDATE UNI_USERS SET VERIFIED_NUM=1 WHERE USER_EMAIL=:email ".
                    "AND USER_KEYPIN=:PIN");
                $stmt->bindValue(":email", $email, PDO::PARAM_STR);
                $stmt->bindValue(":PIN", $PIN, PDO::PARAM_INT);
                if ($stmt->execute()) {
                    return $row;
                }
            }
        }
    }
    return false;
}

function updateKey($user, $oldKey, $newKey) {
    if (!empty($user) and !empty($oldKey) and !empty($newKey)) {
        $stmt = DBIface::connect()->prepare("SELECT USER_EMAIL FROM UNI_USERS WHERE USER_EMAIL=:user");
        $stmt->bindValue(":user", $user, PDO::PARAM_STR);
        if ($stmt->execute()) {
            if (!$stmt->fetch()) {
                return array(false, "No user with this email exists.");
            }
            $stmt = DBIface::connect()->prepare("UPDATE UNI_USERS SET USER_KEYPIN=:newKey WHERE USER_EMAIL=:user ".
                "AND USER_KEYPIN=:oldKey");
            $stmt->bindValue(":user", $user, PDO::PARAM_STR);
            $stmt->bindValue(":newKey", $newKey, PDO::PARAM_INT);
            $stmt->bindValue(":oldKey", $oldKey, PDO::PARAM_INT);
            if ($stmt->execute()) {
                if ($stmt->rowCount() > 0) {
                    return array(true);
                } else {
                    return array(false, "Incorrect current key.");
                }
            }
        }
    }
    return array(false, "SQL error.");
}

function updateUser($email, $name, $alias, $desc, $image, $userID) {
    if (!empty($email) and (!empty($name) or !empty($alias) or !empty($desc) or (!empty($image) and !empty($userID)))) {
        if (!empty($name) or !empty($alias) or !empty($desc)) {
            $query = "UPDATE UNI_USERS SET ";
            $values = array();
            if (!empty($name)) {
                $query = $query."USER_NAME=:name, ";
                $values[":name"] = $name;
            }
            if (!empty($alias)) {
                $query = $query."USER_ALIAS=:alias, ";
                $values[":alias"] = $alias;
            }
            if (!empty($desc)) {
                $query = $query."USER_DESCRIPTION=:desc, ";
                $values[":desc"] = $desc;
            }
            $query = rtrim($query, ", ")." WHERE USER_EMAIL=:email";
            $values[":email"] = $email;
            $stmt = DBIface::connect()->prepare($query);
            if (!$stmt->execute($values)) return false;
        }
        if (!empty($image) and !empty($userID)) {
            $imagePath = (_DIR_."\\..\\images\\profile_images\\profile_image_".$userID.".png");
            saveImage($image, $imagePath);
        }
        return true;
    }
    return false;
}

function userInsert($email, $user, $key, $frag, $alias, $desc, $image) {
    if (!empty($email) and !empty($user) and !empty($key) and !empty($frag) and !empty($alias) and is_string($desc)) {
        $stmt = DBIface::connect()->prepare("SELECT DONE_REG FROM UNI_USERS WHERE USER_EMAIL=:email");
        $stmt->bindValue(":email", $email, PDO::PARAM_STR);
        if ($stmt->execute()) {
            $row = $stmt->fetch(PDO::FETCH_NUM);
            $doneReg = $row[0];
            if ($doneReg == 0) { // REGISTRATION HAS FAILED
                $stmt = DBIface::connect()->prepare("DELETE FROM UNI_USERS WHERE USER_EMAIL=:email");
                $stmt->bindValue(":email", $email, PDO::PARAM_STR);
            }
            if (!$doneReg) { // Should also match doneReg == 0, reinserting after failed
                $stmt = DBIface::connect()->prepare("INSERT INTO UNI_USERS ".
                    "(USER_EMAIL, USER_NAME, USER_KEYPIN, USER_EMAIL_FRAG, USER_ALIAS, USER_DESCRIPTION) ".
                    "VALUES(:email, :userName, :key, :frag, :alias, :desc)");
                $stmt->bindValue(":email", $email, PDO::PARAM_STR);
                $stmt->bindValue(":userName", $user, PDO::PARAM_STR);
                $stmt->bindValue(":key", $key, PDO::PARAM_INT);
                $stmt->bindValue(":frag", $frag, PDO::PARAM_STR);
                $stmt->bindValue(":alias", $alias, PDO::PARAM_STR);
                $stmt->bindValue(":desc", $desc, PDO::PARAM_STR);
                if ($stmt->execute()) {
                    if (!empty($image)) {
                        $userID = DBIface::connect()->lastInsertId();
                        $imagePath = (_DIR_."\\..\\images\\profile_images\\profile_image_".$userID.".png");
                        saveImage($image, $imagePath);
                    }
                    $stmt = DBIface::connect()->prepare("UPDATE UNI_USERS SET DONE_REG=1 WHERE USER_EMAIL=:email");
                    $stmt->bindValue(":email", $email, PDO::PARAM_STR);
                    if ($stmt->execute()) {
                        return array(true);
                    } else {
                        return array(false, "On Update DONE_REG");
                    }
                }
            } else {
                return array(false, "Email in use.");
            }
        }
    }
    return array(false, "SQL error.");
}
