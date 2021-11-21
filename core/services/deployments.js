'use strict';
var models = require('../../models');
var security = require('../../core/utils/security');
var common = require('../../core/utils/common');
var _ = require('lodash');
var moment = require('moment');
var AppError = require('../app-error');
var log4js = require('log4js');
var log = log4js.getLogger('cps:deployments');

var proto = (module.exports = function () {
    function Deployments() {}
    Deployments.__proto__ = proto;
    return Deployments;
});

proto.getAllPackageIdsByDeploymentsId = function (deploymentsId) {
    return models.Packages.findAll({ where: { deployment_id: deploymentsId } });
};

proto.existDeloymentName = function (appId, name) {
    return models.Deployments.findOne({
        where: { appid: appId, name: name },
    }).then((data) => {
        if (!_.isEmpty(data)) {
            throw new AppError.AppError(name + ' already exists');
        } else {
            return data;
        }
    });
};

proto.addDeloyment = function (name, appId, uid) {
    var self = this;
    return models.Users.findByPk(uid).then((user) => {
        if (_.isEmpty(user)) {
            throw new AppError.AppError("Cannot find user");
        }
        return self.existDeloymentName(appId, name).then(() => {
            var identical = user.identical;
            var deploymentKey = security.randToken(28) + identical;
            return models.Deployments.create({
                appid: appId,
                name: name,
                deployment_key: deploymentKey,
                last_deployment_version_id: 0,
                label_id: 0,
            });
        });
    });
};

proto.renameDeloymentByName = function (deploymentName, appId, newName) {
    return this.existDeloymentName(appId, newName).then(() => {
        return models.Deployments.update(
            { name: newName },
            { where: { name: deploymentName, appid: appId } },
        ).then(([affectedCount, affectedRow]) => {
            if (_.gt(affectedCount, 0)) {
                return { name: newName };
            } else {
                throw new AppError.AppError(`Cannot find the deployment "${deploymentName}"`);
            }
        });
    });
};

proto.deleteDeloymentByName = function (deploymentName, appId) {
    return models.Deployments.destroy({
        where: { name: deploymentName, appid: appId },
    }).then((rowNum) => {
        if (_.gt(rowNum, 0)) {
            return { name: `${deploymentName}` };
        } else {
            throw new AppError.AppError(`Cannot find the deployment "${deploymentName}"`);
        }
    });
};

proto.findDeloymentByName = function (deploymentName, appId) {
    log.debug(`findDeloymentByName name:${deploymentName},appId: ${appId}`);
    return models.Deployments.findOne({
        where: { name: deploymentName, appid: appId },
    });
};

proto.findPackagesAndOtherInfos = function (packageId) {
    return models.Packages.findOne({
        where: { id: packageId },
    })
        .then((packageInfo) => {
            if (!packageInfo) {
                return null;
            }
            return Promise.all([
                Promise.resolve(packageInfo),
                models.PackagesDiff.findAll({
                    where: { package_id: packageId },
                }).then((diffs) => {
                    if (diffs.length > 0) {
                        return _.reduce(
                            diffs,
                            (result, v) => {
                                result[_.get(v, 'diff_against_package_hash')] = {
                                    size: _.get(v, 'diff_size'),
                                    url: common.getBlobDownloadUrl(_.get(v, 'diff_blob_url')),
                                };
                                return result;
                            },
                            {},
                        );
                    }
                    return null;
                }),
                models.Users.findOne({
                    where: { id: packageInfo.released_by },
                }),
                models.DeploymentsVersions.findByPk(packageInfo.deployment_version_id),
            ]);
        })
        .then(([packageInfo, packageDiffMap, userInfo, deploymentsVersions]) => {
            return {
                packageInfo,
                packageDiffMap,
                userInfo,
                deploymentsVersions,
            };
        });
};

proto.findDeloymentsPackages = function (deploymentsVersionsId) {
    var self = this;
    return models.DeploymentsVersions.findOne({
        where: { id: deploymentsVersionsId },
    }).then((deploymentsVersionsInfo) => {
        if (deploymentsVersionsInfo) {
            return self.findPackagesAndOtherInfos(deploymentsVersionsInfo.current_package_id);
        }
        return null;
    });
};

proto.formatPackage = function (packageVersion) {
    if (!packageVersion) {
        return null;
    }
    return {
        description: _.get(packageVersion, 'packageInfo.description'),
        isDisabled: false,
        isMandatory: _.get(packageVersion, 'packageInfo.is_mandatory') == 1 ? true : false,
        rollout: 100,
        appVersion: _.get(packageVersion, 'deploymentsVersions.app_version'),
        packageHash: _.get(packageVersion, 'packageInfo.package_hash'),
        blobUrl: common.getBlobDownloadUrl(_.get(packageVersion, 'packageInfo.blob_url')),
        size: _.get(packageVersion, 'packageInfo.size'),
        manifestBlobUrl: common.getBlobDownloadUrl(
            _.get(packageVersion, 'packageInfo.manifest_blob_url'),
        ),
        diffPackageMap: _.get(packageVersion, 'packageDiffMap'),
        releaseMethod: _.get(packageVersion, 'packageInfo.release_method'),
        uploadTime: parseInt(moment(_.get(packageVersion, 'packageInfo.updated_at')).format('x')),
        originalLabel: _.get(packageVersion, 'packageInfo.original_label'),
        originalDeployment: _.get(packageVersion, 'packageInfo.original_deployment'),
        label: _.get(packageVersion, 'packageInfo.label'),
        releasedBy: _.get(packageVersion, 'userInfo.email'),
    };
};

proto.listDeloyments = function (appId) {
    var self = this;
    return models.Deployments.findAll({ where: { appid: appId } }).then((deploymentsInfos) => {
        if (_.isEmpty(deploymentsInfos)) {
            return [];
        }
        return Promise.all(
            deploymentsInfos.map((v) => {
                return self.listDeloyment(v);
            }),
        );
    });
};

proto.listDeloyment = function (deploymentInfo) {
    return this.findDeloymentsPackages([deploymentInfo.last_deployment_version_id])
        .then(this.formatPackage)
        .then((packageInfo) => {
            return {
                createdTime: parseInt(moment(deploymentInfo.created_at).format('x')),
                id: `${deploymentInfo.id}`,
                key: deploymentInfo.deployment_key,
                name: deploymentInfo.name,
                package: packageInfo,
            };
        });
};

proto.getDeploymentHistory = function (deploymentId) {
    var self = this;
    return models.DeploymentsHistory.findAll({
        where: { deployment_id: deploymentId },
        order: [['id', 'desc']],
        limit: 15,
    })
        .then((history) => {
            return _.map(history, (v) => {
                return v.package_id;
            });
        })
        .then((packageIds) => {
            return Promise.all(
                packageIds.map((v) => {
                    return self.findPackagesAndOtherInfos(v).then(self.formatPackage);
                }),
            );
        });
};

proto.deleteDeploymentHistory = function (deploymentId) {
    return models.sequelize.transaction((t) => {
        return Promise.all([
            models.Deployments.update(
                { last_deployment_version_id: 0, label_id: 0 },
                { where: { id: deploymentId }, transaction: t },
            ),
            models.DeploymentsHistory.findAll({
                where: { deployment_id: deploymentId },
                order: [['id', 'desc']],
                limit: 1000,
            }).then((rs) => {
                return Promise.all(
                    rs.map((v) => {
                        return v.destroy({ transaction: t });
                    }),
                );
            }),
            models.DeploymentsVersions.findAll({
                where: { deployment_id: deploymentId },
                order: [['id', 'desc']],
                limit: 1000,
            }).then((rs) => {
                return Promise.all(
                    rs.map((v) => {
                        return v.destroy({ transaction: t });
                    }),
                );
            }),
            models.Packages.findAll({
                where: { deployment_id: deploymentId },
                order: [['id', 'desc']],
                limit: 1000,
            }).then((rs) => {
                return Promise.all(
                    rs.map((v) => {
                        return v.destroy({ transaction: t }).then(() => {
                            return Promise.all([
                                models.PackagesMetrics.destroy({
                                    where: { package_id: v.get('id') },
                                    transaction: t,
                                }),
                                models.PackagesDiff.destroy({
                                    where: { package_id: v.get('id') },
                                    transaction: t,
                                }),
                            ]);
                        });
                    }),
                );
            }),
        ]);
    });
};
