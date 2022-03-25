# CodePush Server

CodePush Server is a backend that manages distribution of "hot deployments" or "over the air updates" for Cordova and React Native apps. Microsoft AppCenter has dropped support for CodePush on new Cordova & React apps already, and will discontinue support for existing apps by April, 2022. This software will allow you to host your own.

## Supported Storage Options

-   local _storage bundle file in local machine_
-   s3 _storage bundle file in [aws](https://aws.amazon.com/)_
-   qiniu _storage bundle file in [qiniu](http://www.qiniu.com/)_
-   oss _storage bundle file in [aliyun](https://www.aliyun.com/product/oss)_
-   tencentcloud _storage bundle file in [tencentcloud](https://cloud.tencent.com/product/cos)_

## Correct use of code-push hot update

-   Both Google's and Apple's developer agreements allow the use of "hot" or "OTA" updates.
-   The OS bundles are different. When using code-push-server, you must create different applications to distinguish them (eg. MyApp-ios and MyApp-android)
-   The code-push app plugins only update resource files (i.e. HTML, JavaScript, CSS, images), not native code, plugins, version number, or other meta-data. So, if any of those things change, you must resubmit to the app stores.
-   Every time a new version is submitted to the App Store, an initial version should also be released to code-push-server based on the submitted version. Because every time a version is released to code-push-server later, code-push-server will compare with the initial version and generate a patch version.

## Clients

### Cordova
[cordova-plugin-code-push](https://github.com/byronigoe/cordova-plugin-code-push)

In config.xml, add reference to your own server:
```xml
<preference name="CodePushDeploymentKey" value="aBcDdFgHiJkLmNoPqRsTuVwXyZ" />
<preference name="CodePushServerUrl" value="http://api.code-push.com/" />
```

### React

TBD

## How to Install

-   [Follow the instructions here](https://github.com/byronigoe/code-push-server/blob/master/docs/install-server.md)

## Accounts

The default account, setup by the database initialization is:
-   username: `admin`
-   password: `123456`

Create your own account by visiting https://your-server.com/auth/register (in config.js make sure common.allowRegistration is set to true)

## How to Use

-   [normal](https://github.com/lisong/code-push-server/blob/master/docs/react-native-code-push.md)
-   [react-native-code-push](https://github.com/Microsoft/react-native-code-push)
-   [code-push](https://github.com/Microsoft/code-push)

## Issues

[code-push-server normal solution](https://github.com/lisong/code-push-server/issues/135)

[An unknown error occurred](https://github.com/lisong/code-push-server/issues?utf8=%E2%9C%93&q=unknown)

[modify password](https://github.com/lisong/code-push-server/issues/43)

# Feature Roadmap

-   [modify password](https://github.com/lisong/code-push-server/issues/43)
-   [code-push-server normal solution (CN)](https://github.com/lisong/code-push-server/issues/135)
-   targetBinaryVersion support
    -   `*`
    -   `1.2.3`
    -   `1.2`/`1.2.*`
    -   `1.2.3 - 1.2.7`
    -   `>=1.2.3 <1.2.7`
    -   `~1.2.3`
    -   `^1.2.3`
