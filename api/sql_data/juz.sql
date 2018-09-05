create database if not exists mafanr_juz;
USE  mafanr_juz;

CREATE TABLE IF NOT EXISTS  `api_release` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `api_id` varchar(255) NOT NULL COMMENT 'API ID',
  `path_type` int(11) DEFAULT '0' COMMENT '是否是路径映射类型，0代表否，1代表是',
  `service` varchar(255) NOT NULL COMMENT 'service名',
  `description` text COMMENT '介绍',

  `route_type` int(11) NOT NULL DEFAULT '1' COMMENT '代理类型,1: direct 2: redirect',
  `addr_type` int(11)  DEFAULT '1' COMMENT '后端地址类型,1:直接寻址 2: ETCD服务发现',
  `backend_addr` varchar(255) NOT NULL COMMENT '后段服务地址',
  `backend_uri` varchar(255) DEFAUlT '' COMMENT '后端服务URI路径',
  `backend_type` int(11) DEFAULT '1' COMMENT '后端服务协议,1: HTTP(S) 2: Mock',
  `mock_data` text COMMENT 'mock类型接口，返回定义的mock数据',

  `retry_strategy` int(11) DEFAULT '0' COMMENT '重试策略ID',
  `bw_strategy` int(11) DEFAULT '0' COMMENT '黑白名单策略ID',
  `traffic_strategy` int(11) DEFAULT '0' COMMENT '流量控制策略ID',

  `traffic_on` int(11) DEFAULT '0' COMMENT '是否开启流量路由',
  `traffic_api` varchar(255) DEFAULT '' COMMENT '指定部分流量路由到该api name',
  `traffic_ratio` int(11) DEFAULT '0' COMMENT '被路由的流量占比, 0<=x<=100',
  `traffic_ips` varchar(255) DEFAULT '' COMMENT '指定来自哪些ip的流量被路由',

  `verify_on` int(11) DEFAULT '0' COMMENT '是否开启参数验证',
  `param_rules` longtext COMMENT '参数验证表',


  `cached_time` int(11) DEFAULT '0' COMMENT '为0表示不开启,其它值代表缓存的时间',
  
  `app` varchar(255) DEFAUlT '' COMMENT '所属应用',
  `status` int(11) DEFAULT '1' COMMENT '发布状态，0代表未发布,1代表已发布',

  `create_date` datetime DEFAULT NULL COMMENT '创建时间',
  `modify_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '记录更新时间',
  PRIMARY KEY (`id`),
   UNIQUE KEY `Index_api_apiid` (`api_id`) USING BTREE,
  KEY `Index_api_modifydate` (`modify_date`) USING BTREE,
  KEY `Index_api_status` (`status`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT 'api发布表';

CREATE TABLE IF NOT EXISTS  `api_define` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `api_id` varchar(255) NOT NULL COMMENT 'API ID',
  `path_type` int(11) DEFAULT '0' COMMENT '是否是路径映射类型，0代表否，1代表是',
  `service` varchar(255) NOT NULL COMMENT 'service名',
  `description` text COMMENT '介绍',

  `route_type` int(11) NOT NULL DEFAULT '1' COMMENT '代理类型,1: direct 2: redirect',
  `addr_type` int(11)  DEFAULT '1' COMMENT '后端地址类型,1:直接寻址 2: ETCD服务发现',
  `backend_addr` varchar(255) NOT NULL COMMENT '后段服务地址',
  `backend_uri` varchar(255) DEFAUlT '' COMMENT '后端服务URI路径',
  `backend_type` int(11) DEFAULT '1' COMMENT '后端服务协议,1: HTTP(S) 2: Mock',
  `mock_data` text COMMENT 'mock类型接口，返回定义的mock数据',

  `retry_strategy` int(11) DEFAULT '0' COMMENT '重试策略ID',
  `bw_strategy` int(11) DEFAULT '0' COMMENT '黑白名单策略ID',
  `traffic_strategy` int(11) DEFAULT '0' COMMENT '流量控制策略ID',

  `traffic_on` int(11) DEFAULT '0' COMMENT '是否开启流量路由',
  `traffic_api` varchar(255) DEFAULT '' COMMENT '指定部分流量路由到该api name',
  `traffic_ratio` int(11) DEFAULT '0' COMMENT '被路由的流量占比, 0<=x<=100',
  `traffic_ips` varchar(255) DEFAULT '' COMMENT '指定来自哪些ip的流量被路由',

  `verify_on` int(11) DEFAULT '0' COMMENT '是否开启参数验证',
  `param_rules` longtext COMMENT '参数验证表',


  `cached_time` int(11) DEFAULT '0' COMMENT '为0表示不开启,其它值代表缓存的时间',

  `app` varchar(255) DEFAUlT '' COMMENT '所属应用',

  `revise_version` varchar(255) NOT NULL COMMENT 'api内容最新版本号',
  `release_version` varchar(255) DEFAULT '' COMMENT '当前已发布的版本号',

  `create_date` datetime DEFAULT NULL COMMENT '创建时间',
  `modify_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '记录更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `Index_api_apiid` (`api_id`) USING BTREE,
  KEY `Index_strategy_modifydate` (`modify_date`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT 'api_define';




CREATE TABLE IF NOT EXISTS  `strategy` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'id',
  `name` varchar(255) DEFAULT '' COMMENT 'strategy名',
  `service` varchar(255) DEFAULT '' COMMENT 'service名',
  `type` int(11) DEFAULT NULL COMMENT '策略类型,1黑白名单；2超时重试等等',
  `sub_type` int(11) DEFAULT NULL COMMENT '策略的子类型，一般是和内容相关的类型，例如黑白名单中的黑或者白',
  `content` longtext COMMENT '策略的具体内容',
  `status` int(11) DEFAULT '1' COMMENT '1开启, 0停用',
  `create_date` datetime DEFAULT NULL,
  `modify_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '记录更新时间',
  PRIMARY KEY (`id`),
  KEY `Index_strategy_service` (`service`) USING BTREE,
  UNIQUE KEY `Index_api_strategy_servicename` (`service`,`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT '通用策略表';

CREATE TABLE IF NOT EXISTS  `audit_log` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'id',
  `user_id` varchar(255) DEFAULT '' COMMENT 'strategy名',
  `service` varchar(255) DEFAULT '' COMMENT 'service名',
  `target_type` int(11) DEFAULT '0' COMMENT '目标类型，1:service 2: api 3: 策略',
  `target_id` varchar(255) DEFAUlT '' COMMENT '操作的目标id/name',
  `op_type` int(11) DEFAULT '0' COMMENT '操作类型:1. 创建 2. 更新 3. 管理 4. 删除',
  `content`  TEXT COMMENT '具体内容',
  `description` TEXT COMMENT '操作备注',
  `modify_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '记录更新时间',
  PRIMARY KEY (`id`),
  KEY `Index_audit_log_service` (`service`) USING BTREE,
  KEY `Index_audit_log_tid` (`target_id`) USING BTREE,
  KEY `Index_audit_log_type` (`target_type`) USING BTREE,
  KEY `Index_audit_log_modifydate` (`modify_date`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT '审计日志表';

CREATE TABLE IF NOT EXISTS  `test_api` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'id',
  `api_id` varchar(255) DEFAULT '' COMMENT 'API ID',
  `params` TEXT COMMENT '测试参数',
  `modify_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '记录更新时间',
  PRIMARY KEY (`id`),
  KEY `Index_api_test_apiid` (`api_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT 'API调试表';
