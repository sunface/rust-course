// Copyright © 2018 NAME HERE <EMAIL ADDRESS>
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package cmd

import (
	"os"
	"os/signal"
	"syscall"

	"github.com/mafanr/juz/misc"
	"github.com/mafanr/juz/traffic"

	"github.com/mafanr/g"

	"github.com/spf13/cobra"
	"go.uber.org/zap"
)

// trafficCmd represents the traffic command
var trafficCmd = &cobra.Command{
	Use:   "traffic",
	Short: "traffic control center",
	Long:  ``,
	Run: func(cmd *cobra.Command, args []string) {
		misc.InitConfig("juz.conf")
		g.InitLogger(misc.Conf.Common.LogLevel)
		g.Info("Application version", zap.String("version", misc.Conf.Common.Version))

		p := &traffic.Traffic{}
		p.Start()

		// 等待服务器停止信号
		chSig := make(chan os.Signal)
		signal.Notify(chSig, syscall.SIGINT, syscall.SIGTERM)

		sig := <-chSig
		g.Info("juz received signal", zap.Any("signal", sig))
	},
}

func init() {
	rootCmd.AddCommand(trafficCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// trafficCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// trafficCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
