package manage

const (
	CodeInvalidUser = 10001
	ErrInvalidUser  = "Username invalid"

	InvalidVerifyTableC = 10002
	InvalidVerifyTableE = "Param verify rule is not a legal regexp"

	InvalidVerifyRuleC = 10003
	InvalidVerifyRuleE = "The test data is not satisfying the verify rule"

	ApiWithServicePrefixC = 10004
	ApiWithServicePrefixE = "API name must be prefix with service name"
	ApiWithServiceSuffixC = 10014
	ApiWithServiceSuffixE = "API ID must suffix with version"

	ServiceEmptyC = 10005
	ServiceEmptyE = "Service name cant be empty"

	ApiOnlyAlphaNumAndDotC = 10006
	ApiOnlyAlphaNumAndDotE = "API name can only be consisted of alphabet and numberic"

	RouteAddrWithHTTPPrefixC = 10007
	RouteAddrWithHTTPPrefixE = "Backend url must prefix with http:// or https://"

	RouteAddrEmptyC = 10008
	RouteAddrEmptyE = "Backend url cant be empty"

	RouteProtoInvalidC = 10009
	RouteProtoInvalidE = "Backend type invalid"

	ReqTimeoutInvalidC = 10010
	ReqTimeoutInvalidE = "Timeout must be in (0,60]"

	RetryTimesInvalidC = 10011
	RetryTimesInvalidE = "Retry times must be in (0,5]"

	RetryIntvInvalidC = 10012
	RetryIntvInvalidE = "Retry interval must be in (0,30]"

	TrafficRatioInvalidC = 10013
	TrafficRatioInvalidE = "Traffic ratio must be in [0,100]"

	ApiPathTypeInvalidC = 10014
	ApiPathTypeInvalidE = "API URL type must be 0 or 1"

	ApiNotExistE = "Api not exist"
	ApiNotExistC = 10015

	ApiOnlyAlphaNumAndUriC = 10016
	ApiOnlyAlphaNumAndUriE = "API name can only be consisted of alphabet,numberic and /"

	ApiReservePathC = 10017
	ApiReservePathE = "You cant use the reserverd name"

	APIOfflineE = "API not released"
	APIOfflineC = 1058

	ApiStillReleasedE = "API still being released"
	ApiStillReleasedC = 1059

	ApiInactiveNotLongEnoughE = "You cant delete api until 30 seconds after offline"
	ApiInactiveNotLongEnoughC = 1060

	StrategyNameExistE = "Strategy name already exist"
	StrategyNameExistc = 1061
)
