'use strict';
var _ = require('lodash');
var nodemailer = require('nodemailer');
var config = require('../config');

var proto = (module.exports = function () {
    function EmailManager() {}
    EmailManager.__proto__ = proto;
    return EmailManager;
});

proto.sendMail = function (options) {
    return new Promise((resolve, reject) => {
        if (!_.get(options, 'to')) {
            return reject(new AppError.AppError(`"To" is a required parameter`));
        }
        var smtpConfig = _.get(config, 'smtpConfig');
        if (!smtpConfig || !smtpConfig.host) {
            resolve({});
        }
        var transporter = nodemailer.createTransport(smtpConfig);
        var sendEmailAddress = _.get(smtpConfig, 'auth.user');
        var defaultMailOptions = {
            from: `"CodePush Server" <${sendEmailAddress}>`, // sender address
            to: '', // list of receivers 必传参数
            subject: 'CodePush Server', // Subject line
            html: '', // html body
        };
        var mailOptions = _.assign(defaultMailOptions, options);
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                return reject(error);
            }
            resolve(info);
        });
    });
};

proto.sendRegisterCode = function (email, code) {
    return proto.sendMail({
        to: email,
        html: `<div>Your verification code is: <em style="color:red;">${code}</em><br>It is valid for 20 minutes.</div>`,
    });
};
