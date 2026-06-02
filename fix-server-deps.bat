@echo off
chcp 65001 >nul 2>&1
cd /d "%~dp0"

echo  修复后端依赖...
echo.

::: 清理旧的 node_modules
if exist "server\node_modules" rmdir /s /q "server\node_modules"
mkdir "server\node_modules"

::: 从 .pnpm 复制所有 server 依赖
setlocal enabledelayedexpansion

set "PNPM_DIR=node_modules\.pnpm"
set "SERVER_NM=server\node_modules"

::: 复制 express 及其依赖
echo  复制 express...
xcopy /E /I /Y "%PNPM_DIR%\express@4.22.2\node_modules\express" "%SERVER_NM%\express" >nul

echo  复制 express 依赖...
for /d %%d in ("%PNPM_DIR%\accepts@*") do xcopy /E /I /Y "%%d\node_modules\accepts" "%SERVER_NM%\accepts" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\body-parser@*") do xcopy /E /I /Y "%%d\node_modules\body-parser" "%SERVER_NM%\body-parser" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\content-disposition@*") do xcopy /E /I /Y "%%d\node_modules\content-disposition" "%SERVER_NM%\content-disposition" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\content-type@*") do xcopy /E /I /Y "%%d\node_modules\content-type" "%SERVER_NM%\content-type" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\cookie@*") do xcopy /E /I /Y "%%d\node_modules\cookie" "%SERVER_NM%\cookie" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\cookie-signature@*") do xcopy /E /I /Y "%%d\node_modules\cookie-signature" "%SERVER_NM%\cookie-signature" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\debug@*") do xcopy /E /I /Y "%%d\node_modules\debug" "%SERVER_NM%\debug" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\depd@*") do xcopy /E /I /Y "%%d\node_modules\depd" "%SERVER_NM%\depd" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\encodeurl@*") do xcopy /E /I /Y "%%d\node_modules\encodeurl" "%SERVER_NM%\encodeurl" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\escape-html@*") do xcopy /E /I /Y "%%d\node_modules\escape-html" "%SERVER_NM%\escape-html" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\etag@*") do xcopy /E /I /Y "%%d\node_modules\etag" "%SERVER_NM%\etag" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\finalhandler@*") do xcopy /E /I /Y "%%d\node_modules\finalhandler" "%SERVER_NM%\finalhandler" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\fresh@*") do xcopy /E /I /Y "%%d\node_modules\fresh" "%SERVER_NM%\fresh" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\http-errors@*") do xcopy /E /I /Y "%%d\node_modules\http-errors" "%SERVER_NM%\http-errors" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\merge-descriptors@*") do xcopy /E /I /Y "%%d\node_modules\merge-descriptors" "%SERVER_NM%\merge-descriptors" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\methods@*") do xcopy /E /I /Y "%%d\node_modules\methods" "%SERVER_NM%\methods" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\on-finished@*") do xcopy /E /I /Y "%%d\node_modules\on-finished" "%SERVER_NM%\on-finished" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\parseurl@*") do xcopy /E /I /Y "%%d\node_modules\parseurl" "%SERVER_NM%\parseurl" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\path-to-regexp@*") do xcopy /E /I /Y "%%d\node_modules\path-to-regexp" "%SERVER_NM%\path-to-regexp" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\proxy-addr@*") do xcopy /E /I /Y "%%d\node_modules\proxy-addr" "%SERVER_NM%\proxy-addr" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\qs@*") do xcopy /E /I /Y "%%d\node_modules\qs" "%SERVER_NM%\qs" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\range-parser@*") do xcopy /E /I /Y "%%d\node_modules\range-parser" "%SERVER_NM%\range-parser" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\safe-buffer@*") do xcopy /E /I /Y "%%d\node_modules\safe-buffer" "%SERVER_NM%\safe-buffer" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\send@*") do xcopy /E /I /Y "%%d\node_modules\send" "%SERVER_NM%\send" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\serve-static@*") do xcopy /E /I /Y "%%d\node_modules\serve-static" "%SERVER_NM%\serve-static" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\setprototypeof@*") do xcopy /E /I /Y "%%d\node_modules\setprototypeof" "%SERVER_NM%\setprototypeof" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\statuses@*") do xcopy /E /I /Y "%%d\node_modules\statuses" "%SERVER_NM%\statuses" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\toidentifier@*") do xcopy /E /I /Y "%%d\node_modules\toidentifier" "%SERVER_NM%\toidentifier" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\type-is@*") do xcopy /E /I /Y "%%d\node_modules\type-is" "%SERVER_NM%\type-is" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\utils-merge@*") do xcopy /E /I /Y "%%d\node_modules\utils-merge" "%SERVER_NM%\utils-merge" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\vary@*") do xcopy /E /I /Y "%%d\node_modules\vary" "%SERVER_NM%\vary" >nul 2>nul

::: 复制其他 server 依赖
echo  复制 cors...
for /d %%d in ("%PNPM_DIR%\cors@*") do xcopy /E /I /Y "%%d\node_modules\cors" "%SERVER_NM%\cors" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\cors@*") do (
    for /d %%e in ("%%d\node_modules\*") do xcopy /E /I /Y "%%e" "%SERVER_NM%\%%~nxe" >nul 2>nul
)

echo  复制 helmet...
for /d %%d in ("%PNPM_DIR%\helmet@*") do xcopy /E /I /Y "%%d\node_modules\helmet" "%SERVER_NM%\helmet" >nul 2>nul

echo  复制 morgan...
for /d %%d in ("%PNPM_DIR%\morgan@*") do xcopy /E /I /Y "%%d\node_modules\morgan" "%SERVER_NM%\morgan" >nul 2>nul

echo  复制 compression...
for /d %%d in ("%PNPM_DIR%\compression@*") do xcopy /E /I /Y "%%d\node_modules\compression" "%SERVER_NM%\compression" >nul 2>nul

echo  复制 dotenv...
for /d %%d in ("%PNPM_DIR%\dotenv@*") do xcopy /E /I /Y "%%d\node_modules\dotenv" "%SERVER_NM%\dotenv" >nul 2>nul

echo  复制 jsonwebtoken...
for /d %%d in ("%PNPM_DIR%\jsonwebtoken@*") do xcopy /E /I /Y "%%d\node_modules\jsonwebtoken" "%SERVER_NM%\jsonwebtoken" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\jsonwebtoken@*") do (
    for /d %%e in ("%%d\node_modules\*") do xcopy /E /I /Y "%%e" "%SERVER_NM%\%%~nxe" >nul 2>nul
)

echo  复制 bcryptjs...
for /d %%d in ("%PNPM_DIR%\bcryptjs@*") do xcopy /E /I /Y "%%d\node_modules\bcryptjs" "%SERVER_NM%\bcryptjs" >nul 2>nul

echo  复制 express-validator...
for /d %%d in ("%PNPM_DIR%\express-validator@*") do xcopy /E /I /Y "%%d\node_modules\express-validator" "%SERVER_NM%\express-validator" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\express-validator@*") do (
    for /d %%e in ("%%d\node_modules\*") do xcopy /E /I /Y "%%e" "%SERVER_NM%\%%~nxe" >nul 2>nul
)

echo  复制 sequelize...
for /d %%d in ("%PNPM_DIR%\sequelize@*") do xcopy /E /I /Y "%%d\node_modules\sequelize" "%SERVER_NM%\sequelize" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\sequelize@*") do (
    for /d %%e in ("%%d\node_modules\*") do xcopy /E /I /Y "%%e" "%SERVER_NM%\%%~nxe" >nul 2>nul
)

echo  复制 sqlite...
for /d %%d in ("%PNPM_DIR%\sqlite@*") do xcopy /E /I /Y "%%d\node_modules\sqlite" "%SERVER_NM%\sqlite" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\sqlite@*") do (
    for /d %%e in ("%%d\node_modules\*") do xcopy /E /I /Y "%%e" "%SERVER_NM%\%%~nxe" >nul 2>nul
)

echo  复制 sqlite3...
for /d %%d in ("%PNPM_DIR%\sqlite3@*") do xcopy /E /I /Y "%%d\node_modules\sqlite3" "%SERVER_NM%\sqlite3" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\sqlite3@*") do (
    for /d %%e in ("%%d\node_modules\*") do xcopy /E /I /Y "%%e" "%SERVER_NM%\%%~nxe" >nul 2>nul
)

echo  复制 nodemon...
for /d %%d in ("%PNPM_DIR%\nodemon@*") do xcopy /E /I /Y "%%d\node_modules\nodemon" "%SERVER_NM%\nodemon" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\nodemon@*") do (
    for /d %%e in ("%%d\node_modules\*") do xcopy /E /I /Y "%%e" "%SERVER_NM%\%%~nxe" >nul 2>nul
)

::: 复制通用依赖
echo  复制通用依赖...
for /d %%d in ("%PNPM_DIR%\ms@*") do xcopy /E /I /Y "%%d\node_modules\ms" "%SERVER_NM%\ms" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\mime@*") do xcopy /E /I /Y "%%d\node_modules\mime" "%SERVER_NM%\mime" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\mime-db@*") do xcopy /E /I /Y "%%d\node_modules\mime-db" "%SERVER_NM%\mime-db" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\mime-types@*") do xcopy /E /I /Y "%%d\node_modules\mime-types" "%SERVER_NM%\mime-types" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\forwarded@*") do xcopy /E /I /Y "%%d\node_modules\forwarded" "%SERVER_NM%\forwarded" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\ipaddr.js@*") do xcopy /E /I /Y "%%d\node_modules\ipaddr.js" "%SERVER_NM%\ipaddr.js" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\raw-body@*") do xcopy /E /I /Y "%%d\node_modules\raw-body" "%SERVER_NM%\raw-body" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\bytes@*") do xcopy /E /I /Y "%%d\node_modules\bytes" "%SERVER_NM%\bytes" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\unpipe@*") do xcopy /E /I /Y "%%d\node_modules\unpipe" "%SERVER_NM%\unpipe" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\destroy@*") do xcopy /E /I /Y "%%d\node_modules\destroy" "%SERVER_NM%\destroy" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\iconv-lite@*") do xcopy /E /I /Y "%%d\node_modules\iconv-lite" "%SERVER_NM%\iconv-lite" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\safer-buffer@*") do xcopy /E /I /Y "%%d\node_modules\safer-buffer" "%SERVER_NM%\safer-buffer" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\type-check@*") do xcopy /E /I /Y "%%d\node_modules\type-check" "%SERVER_NM%\type-check" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\side-channel@*") do xcopy /E /I /Y "%%d\node_modules\side-channel" "%SERVER_NM%\side-channel" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\object-inspect@*") do xcopy /E /I /Y "%%d\node_modules\object-inspect" "%SERVER_NM%\object-inspect" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\function-bind@*") do xcopy /E /I /Y "%%d\node_modules\function-bind" "%SERVER_NM%\function-bind" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\get-intrinsic@*") do xcopy /E /I /Y "%%d\node_modules\get-intrinsic" "%SERVER_NM%\get-intrinsic" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\has-property-descriptors@*") do xcopy /E /I /Y "%%d\node_modules\has-property-descriptors" "%SERVER_NM%\has-property-descriptors" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\has-proto@*") do xcopy /E /I /Y "%%d\node_modules\has-proto" "%SERVER_NM%\has-proto" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\has-symbols@*") do xcopy /E /I /Y "%%d\node_modules\has-symbols" "%SERVER_NM%\has-symbols" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\call-bind@*") do xcopy /E /I /Y "%%d\node_modules\call-bind" "%SERVER_NM%\call-bind" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\define-data-property@*") do xcopy /E /I /Y "%%d\node_modules\define-data-property" "%SERVER_NM%\define-data-property" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\gopd@*") do xcopy /E /I /Y "%%d\node_modules\gopd" "%SERVER_NM%\gopd" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\set-function-length@*") do xcopy /E /I /Y "%%d\node_modules\set-function-length" "%SERVER_NM%\set-function-length" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\set-function-name@*") do xcopy /E /I /Y "%%d\node_modules\set-function-name" "%SERVER_NM%\set-function-name" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\array-buffer-byte-length@*") do xcopy /E /I /Y "%%d\node_modules\array-buffer-byte-length" "%SERVER_NM%\array-buffer-byte-length" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\is-buffer@*") do xcopy /E /I /Y "%%d\node_modules\is-buffer" "%SERVER_NM%\is-buffer" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\is-shared-array-buffer@*") do xcopy /E /I /Y "%%d\node_modules\is-shared-array-buffer" "%SERVER_NM%\is-shared-array-buffer" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\is-weakref@*") do xcopy /E /I /Y "%%d\node_modules\is-weakref" "%SERVER_NM%\is-weakref" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\is-negative-zero@*") do xcopy /E /I /Y "%%d\node_modules\is-negative-zero" "%SERVER_NM%\is-negative-zero" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\is-regex@*") do xcopy /E /I /Y "%%d\node_modules\is-regex" "%SERVER_NM%\is-regex" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\is-date-object@*") do xcopy /E /I /Y "%%d\node_modules\is-date-object" "%SERVER_NM%\is-date-object" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\is-symbol@*") do xcopy /E /I /Y "%%d\node_modules\is-symbol" "%SERVER_NM%\is-symbol" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\is-number-object@*") do xcopy /E /I /Y "%%d\node_modules\is-number-object" "%SERVER_NM%\is-number-object" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\is-string@*") do xcopy /E /I /Y "%%d\node_modules\is-string" "%SERVER_NM%\is-string" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\is-boolean-object@*") do xcopy /E /I /Y "%%d\node_modules\is-boolean-object" "%SERVER_NM%\is-boolean-object" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\is-bigint@*") do xcopy /E /I /Y "%%d\node_modules\is-bigint" "%SERVER_NM%\is-bigint" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\which-boxed-primitive@*") do xcopy /E /I /Y "%%d\node_modules\which-boxed-primitive" "%SERVER_NM%\which-boxed-primitive" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\which-collection@*") do xcopy /E /I /Y "%%d\node_modules\which-collection" "%SERVER_NM%\which-collection" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\is-map@*") do xcopy /E /I /Y "%%d\node_modules\is-map" "%SERVER_NM%\is-map" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\is-set@*") do xcopy /E /I /Y "%%d\node_modules\is-set" "%SERVER_NM%\is-set" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\is-weakmap@*") do xcopy /E /I /Y "%%d\node_modules\is-weakmap" "%SERVER_NM%\is-weakmap" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\is-weakset@*") do xcopy /E /I /Y "%%d\node_modules\is-weakset" "%SERVER_NM%\is-weakset" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\is-async-function@*") do xcopy /E /I /Y "%%d\node_modules\is-async-function" "%SERVER_NM%\is-async-function" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\is-callable@*") do xcopy /E /I /Y "%%d\node_modules\is-callable" "%SERVER_NM%\is-callable" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\is-generator-function@*") do xcopy /E /I /Y "%%d\node_modules\is-generator-function" "%SERVER_NM%\is-generator-function" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\for-each@*") do xcopy /E /I /Y "%%d\node_modules\for-each" "%SERVER_NM%\for-each" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\available-typed-arrays@*") do xcopy /E /I /Y "%%d\node_modules\available-typed-arrays" "%SERVER_NM%\available-typed-arrays" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\which-typed-array@*") do xcopy /E /I /Y "%%d\node_modules\which-typed-array" "%SERVER_NM%\which-typed-array" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\globalthis@*") do xcopy /E /I /Y "%%d\node_modules\globalthis" "%SERVER_NM%\globalthis" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\define-properties@*") do xcopy /E /I /Y "%%d\node_modules\define-properties" "%SERVER_NM%\define-properties" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\foreach@*") do xcopy /E /I /Y "%%d\node_modules\foreach" "%SERVER_NM%\foreach" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\object-keys@*") do xcopy /E /I /Y "%%d\node_modules\object-keys" "%SERVER_NM%\object-keys" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\object.assign@*") do xcopy /E /I /Y "%%d\node_modules\object.assign" "%SERVER_NM%\object.assign" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\has@*") do xcopy /E /I /Y "%%d\node_modules\has" "%SERVER_NM%\has" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\hasown@*") do xcopy /E /I /Y "%%d\node_modules\hasown" "%SERVER_NM%\hasown" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\get-symbol-description@*") do xcopy /E /I /Y "%%d\node_modules\get-symbol-description" "%SERVER_NM%\get-symbol-description" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\internal-slot@*") do xcopy /E /I /Y "%%d\node_modules\internal-slot" "%SERVER_NM%\internal-slot" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\side-channel@*") do xcopy /E /I /Y "%%d\node_modules\side-channel" "%SERVER_NM%\side-channel" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\regexp.prototype.flags@*") do xcopy /E /I /Y "%%d\node_modules\regexp.prototype.flags" "%SERVER_NM%\regexp.prototype.flags" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\functions-have-names@*") do xcopy /E /I /Y "%%d\node_modules\functions-have-names" "%SERVER_NM%\functions-have-names" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\es-abstract@*") do xcopy /E /I /Y "%%d\node_modules\es-abstract" "%SERVER_NM%\es-abstract" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\es-to-primitive@*") do xcopy /E /I /Y "%%d\node_modules\es-to-primitive" "%SERVER_NM%\es-to-primitive" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\has-tostringtag@*") do xcopy /E /I /Y "%%d\node_modules\has-tostringtag" "%SERVER_NM%\has-tostringtag" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\has-property-enumerable@*") do xcopy /E /I /Y "%%d\node_modules\has-property-enumerable" "%SERVER_NM%\has-property-enumerable" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\json5@*") do xcopy /E /I /Y "%%d\node_modules\json5" "%SERVER_NM%\json5" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\minimist@*") do xcopy /E /I /Y "%%d\node_modules\minimist" "%SERVER_NM%\minimist" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\lodash@*") do xcopy /E /I /Y "%%d\node_modules\lodash" "%SERVER_NM%\lodash" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\validator@*") do xcopy /E /I /Y "%%d\node_modules\validator" "%SERVER_NM%\validator" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\wkx@*") do xcopy /E /I /Y "%%d\node_modules\wkx" "%SERVER_NM%\wkx" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\uuid@*") do xcopy /E /I /Y "%%d\node_modules\uuid" "%SERVER_NM%\uuid" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\inflection@*") do xcopy /E /I /Y "%%d\node_modules\inflection" "%SERVER_NM%\inflection" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\toposort-class@*") do xcopy /E /I /Y "%%d\node_modules\toposort-class" "%SERVER_NM%\toposort-class" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\dottie@*") do xcopy /E /I /Y "%%d\node_modules\dottie" "%SERVER_NM%\dottie" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\lodash@*") do xcopy /E /I /Y "%%d\node_modules\lodash" "%SERVER_NM%\lodash" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\moment@*") do xcopy /E /I /Y "%%d\node_modules\moment" "%SERVER_NM%\moment" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\moment-timezone@*") do xcopy /E /I /Y "%%d\node_modules\moment-timezone" "%SERVER_NM%\moment-timezone" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\pg-connection-string@*") do xcopy /E /I /Y "%%d\node_modules\pg-connection-string" "%SERVER_NM%\pg-connection-string" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\retry-as-promised@*") do xcopy /E /I /Y "%%d\node_modules\retry-as-promised" "%SERVER_NM%\retry-as-promised" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\semver@*") do xcopy /E /I /Y "%%d\node_modules\semver" "%SERVER_NM%\semver" >nul 2>nul
for /d %%d in ("%PNPM_DIR%\@types+validator@*") do xcopy /E /I /Y "%%d\node_modules\@types\validator" "%SERVER_NM%\@types\validator" >nul 2>nul

::: 通用工具依赖
for /d %%d in ("%PNPM_DIR%\ms@*") do xcopy /E /I /Y "%%d\node_modules\ms" "%SERVER_NM%\ms" >nul 2>nul

echo.
echo  ✓ 后端依赖修复完成
echo.
pause