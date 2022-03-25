## Install Node and NPM

[Node Downloads](https://nodejs.org/en/download/)

> (choose latest LTS version)

## Install PM2

```bash
$ sudo npm i -g pm2
```

## Install MySQL

-   [Linux](https://dev.mysql.com/doc/refman/8.0/en/linux-installation.html)
-   [macOS](https://dev.mysql.com/doc/refman/8.0/en/osx-installation.html)
-   [Microsoft Windows](https://dev.mysql.com/doc/refman/8.0/en/windows-installation.html)
-   [Others](https://dev.mysql.com/doc/refman/8.0/en/installing.html)

> notice. mysql8.x default auth caching_sha2_pasword not support in node-mysql2 see [issue](https://github.com/mysqljs/mysql/pull/1962)

## Install Redis

-   [Redis Quick Start](https://redis.io/topics/quickstart)

## Get code-push-server from NPM

```shell
$ git clone https://github.com/byronigoe/code-push-server.git
$ cd code-push-server
$ npm install
```

# GET Redis

```shell
yum install redis.x86_64
```
[Redis for Windows](https://github.com/microsoftarchive/redis/releases)

## INIT DATABASE

Create a MySQL user, e.g.
```shell
CREATE USER 'codepush'@'localhost' IDENTIFIED BY 'create_a_password';
```

Grant appropriate permissions, e.g.
```shell
GRANT ALL PRIVILEGES ON codepush . * TO 'codepush'@'localhost';
```

Full command
```shell
$ code-push-server-db init --dbhost "your mysql host" --dbport "your mysql port" --dbname "your database" --dbuser "your mysql user" --dbpassword "your mysql password"
```

Defaults (if omitted) are:
| dbhost | localhost |
| dbport | 3306 |
| dbname | codepush |
| dbuser | root |

Minimally
```shell
$ code-push-server-db init --dbpassword "your mysql root password"
```

or from source code

```shell
$ ./bin/db init --dbhost "your mysql host" --dbport "your mysql port" --dbname "your database" --dbuser "your mysql user" --dbpassword "your mysql password"
```

> output: success

## Configure code-push-server

check out the supported config items in [config.ts](../src/core/config.ts)

Save the file [config.js](https://github.com/byronigoe/code-push-server/blob/master/config/config.js) and modify the properties, or set the corresponding environment variables (e.g. in process.json).

-   `local`.`storageDir` change to your directory, make sure you have read/write permissions.
-   `local`.`downloadUrl` replace `127.0.0.1` to your machine's IP.
-   `common`.`dataDir` change to your directory, make sure you have read/write permissions.
-   `jwt`.`tokenSecret` get a random string from `https://www.grc.com/passwords.htm`, and replace the value `INSERT_RANDOM_TOKEN_KEY`.
-   `db` config: `username`,`password`,`host`,`port` set the environment variables, or change them in this file.
-   `smtpConfig` config: `host`,`auth.user`,`auth.pass` needed if you enable `common.allowRegistration`

## CONFIGURE for pm2

Save the file [process.json](https://github.com/byronigoe/code-push-server/blob/master/process.json)

Some configuration properties have to change:

-   `script` if you install code-push-server from npm use `code-push-server`, or use `"your source code dir"/bin/www`
-   `CONFIG_FILE` absolute path to the config.js you downloaded.

## START SERVICE

```shell
$ pm2 start process.json
```

## Restart Service

```shell
$ pm2 reload process.json
```

## Stop Service

```shell
$ pm2 stop process.json
```

## Check Service is OK

```shell
$ curl -I https://your-server.com/
```

> return httpCode `200 OK`

```http
HTTP/1.1 200 OK
X-DNS-Prefetch-Control: off
X-Frame-Options: SAMEORIGIN
Strict-Transport-Security: max-age=15552000; includeSubDomains
X-Download-Options: noopen
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Content-Type: text/html; charset=utf-8
Content-Length: 592
ETag: W/"250-IiCMcM1ZUFSswSYCU0KeFYFEMO8"
Date: Sat, 25 Aug 2018 15:45:46 GMT
Connection: keep-alive
```

## Use Redis improve concurrency and security

> config redis in config.js

-   `updateCheckCache`
-   `rolloutClientUniqueIdCache`
-   `tryLoginTimes`

## Upgrade from old version

```shell
$ npm install -g @shm-open/code-push-server@latest
$ code-push-server-db upgrade --dbhost "your mysql host" --dbport "your mysql port"  --dbuser "your mysql user" --dbpassword "your mysql password" # upgrade codepush database
$ pm2 restart code-push-server # restart service
```

_from source code_

```shell
$ cd /path/to/code-push-server
$ git pull --rebase origin master
$ ./bin/db upgrade --dbhost "your mysql host" --dbport "your mysql port"  --dbuser "your mysql user" --dbpassword "your mysql password"
# upgrade codepush database
$ pm2 restart code-push-server # restart service
```

## View pm2 logs

```shell
$ pm2 ls
$ pm2 show code-push-server
$ tail -f "output file path"
```

## Support Storage mode

-   local (default)
-   s3 (aws)
-   qiniu (qiniu)
-   oss (aliyun)
-   tencentcloud

## Default listen Host/Port 0.0.0.0/3000

> you can change it in process.json, env: PORT,HOST

## [code-push-cli](https://github.com/byronigoe/code-push-cli)

> Use code-push-cli manage CodePush Server

```shell
$ npm install https://github.com/byronigoe/code-push-cli@latest -g
$ code-push register https://your-server.com #or login with default account:admin password:123456
```

## Configure a react-native project

> Follow the react-native-code-push docs, addition iOS add a new entry named CodePushServerURL, whose value is the key of ourself CodePushServer URL. Android use the new CodePush constructor in MainApplication point CodePushServerUrl

iOS eg. in file Info.plist

```xml
...
<key>CodePushDeploymentKey</key>
<string>YourCodePushKey</string>
<key>CodePushServerURL</key>
<string>YourCodePushServerUrl</string>
...
```

Android eg. in file MainApplication.java

```java
@Override
protected List<ReactPackage> getPackages() {
  return Arrays.<ReactPackage>asList(
      new MainReactPackage(),
      new CodePush(
         "YourKey",
         MainApplication.this,
         BuildConfig.DEBUG,
         "YourCodePushServerUrl"
      )
  );
}
```

## [cordova-plugin-code-push](https://github.com/Microsoft/cordova-plugin-code-push) for cordova

```shell
$ cd /path/to/project
$ cordova plugin add cordova-plugin-code-push@latest --save
```

## Configure a Cordova project

edit config.xml. add code below.

```xml
<platform name="android">
    <preference name="CodePushDeploymentKey" value="nVHPr6asLSusnWoLBNCSktk9FWbiqLF160UDg" />
</platform>
<platform name="ios">
    <preference name="CodePushDeploymentKey" value="Iw5DMZSIrCOS7hbLsY5tHAHNITFQqLF160UDg" />
</platform>
<preference name="CodePushServerUrl" value="https://your-server.com/" />
```
