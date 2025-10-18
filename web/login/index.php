<!DOCTYPE html>
<html lang="RU">
<?php
    $_head = array(
        "dir" => __DIR__
    );
    include __DIR__ . "/../assets/embed/head.php";
?>
<body>
    <div class="migre-v1-content">
        <div class="migre-v1-container">
            <header class="migre-v1-main-header">
                <div class="migre-v1-main-header-container">
                    <div class="migre-v1-main-header-inner">
                        <button class="migre-v1-main-header-login-button" onclick="login_Clicked()">Войти</button>
                    </div>
                </div>
            </header>
            <div class="migre-v1-main">
                <div class="migre-v1-main-login">
                    <div class="migre-v1-main-login-header">
                        <h1>Войти</h1>
                    </div>
                    <div class="migre-v1-main-login-fields">
                        <div class="migre-v1-main-login-field-wrapper">
                            <div>Эл. почта</div>
                            <div class="migre-v1-main-login-field-container">
                                <input type="text">
                            </div>
                        </div>
                        <div class="migre-v1-main-login-field-wrapper">
                            <div>Пароль</div>
                            <div class="migre-v1-main-login-field-container">
                                <input type="text">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>