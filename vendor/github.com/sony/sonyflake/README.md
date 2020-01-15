Sonyflake
=========

[![GoDoc](https://godoc.org/github.com/sony/sonyflake?status.svg)](http://godoc.org/github.com/sony/sonyflake)
[![Build Status](https://travis-ci.org/sony/sonyflake.svg?branch=master)](https://travis-ci.org/sony/sonyflake)
[![Coverage Status](https://coveralls.io/repos/sony/sonyflake/badge.svg?branch=master&service=github)](https://coveralls.io/github/sony/sonyflake?branch=master)
[![Go Report Card](https://goreportcard.com/badge/github.com/sony/sonyflake)](https://goreportcard.com/report/github.com/sony/sonyflake)

Sonyflake is a distributed unique ID generator inspired by [Twitter's Snowflake](https://blog.twitter.com/2010/announcing-snowflake).  
A Sonyflake ID is composed of

    39 bits for time in units of 10 msec
     8 bits for a sequence number
    16 bits for a machine id

Installation
------------

```
go get github.com/sony/sonyflake
```

Usage
-----

The function NewSonyflake creates a new Sonyflake instance.

```go
func NewSonyflake(st Settings) *Sonyflake
```

You can configure Sonyflake by the struct Settings:

```go
type Settings struct {
	StartTime      time.Time
	MachineID      func() (uint16, error)
	CheckMachineID func(uint16) bool
}
```

- StartTime is the time since which the Sonyflake time is defined as the elapsed time.
  If StartTime is 0, the start time of the Sonyflake is set to "2014-09-01 00:00:00 +0000 UTC".
  If StartTime is ahead of the current time, Sonyflake is not created.

- MachineID returns the unique ID of the Sonyflake instance.
  If MachineID returns an error, Sonyflake is not created.
  If MachineID is nil, default MachineID is used.
  Default MachineID returns the lower 16 bits of the private IP address.

- CheckMachineID validates the uniqueness of the machine ID.
  If CheckMachineID returns false, Sonyflake is not created.
  If CheckMachineID is nil, no validation is done.

In order to get a new unique ID, you just have to call the method NextID.

```go
func (sf *Sonyflake) NextID() (uint64, error)
```

NextID can continue to generate IDs for about 174 years from StartTime.
But after the Sonyflake time is over the limit, NextID returns an error.

AWS VPC and Docker
------------------

The [awsutil](https://github.com/sony/sonyflake/blob/master/awsutil) package provides
the function AmazonEC2MachineID that returns the lower 16-bit private IP address of the Amazon EC2 instance.
It also works correctly on Docker
by retrieving [instance metadata](http://docs.aws.amazon.com/en_us/AWSEC2/latest/UserGuide/ec2-instance-metadata.html).

[AWS VPC](http://docs.aws.amazon.com/en_us/AmazonVPC/latest/UserGuide/VPC_Subnets.html)
is assigned a single CIDR with a netmask between /28 and /16.
So if each EC2 instance has a unique private IP address in AWS VPC,
the lower 16 bits of the address is also unique.
In this common case, you can use AmazonEC2MachineID as Settings.MachineID.

See [example](https://github.com/sony/sonyflake/blob/master/example) that runs Sonyflake on AWS Elastic Beanstalk.

License
-------

The MIT License (MIT)

See [LICENSE](https://github.com/sony/sonyflake/blob/master/LICENSE) for details.
