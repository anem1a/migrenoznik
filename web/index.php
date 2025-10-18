<!DOCTYPE html>
<html lang="RU">
<?php
    $_head = array(
        "dir" => __DIR__
    );
    include __DIR__ . "/assets/embed/head.php";
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
                <div class="migre-v1-main-diary">
                    <div class="migre-v1-main-diary-wrapper" id="migre-diary-wrapper">
                    </div>
                </div>  
                <div class="migre-v1-main-bottom">
                    <div class="migre-v1-main-bottom-row">
                        <div class="migre-v1-main-bottom-button-wrapper">
                            <button class="migre-v1-main-bottom-button" id="migre-diary-main-bottom-button" onclick="migraine_now_button_Clicked()">Отметить мигрень сейчас</button>
                        </div>
                    </div>
                </div>    
            </div>
        </div>
    </div>
</body>
</html>